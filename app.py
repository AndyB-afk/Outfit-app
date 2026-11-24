import json
import os
import sqlite3

from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
    send_from_directory,
    url_for,
)


app = Flask(__name__)

BASE_DIR = os.path.abspath(app.root_path)
DATABASE_PATH = os.path.join(BASE_DIR, "outfit.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_database():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_database() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS clothes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                image_filename TEXT,
                color TEXT NOT NULL DEFAULT 'unknown',
                style TEXT NOT NULL DEFAULT 'casual',
                available INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT NOT NULL,
                selected_items TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        existing_count = connection.execute(
            "SELECT COUNT(*) FROM clothes"
        ).fetchone()[0]

        if existing_count == 0:
            seed_clothes = [
                ("Gray Santa-Cruz", "hoodies", "gray", "casual"),
                ("Black Disney", "hoodies", "black", "casual"),
                ("Royal-Blue Eagles", "hoodies", "blue", "streetwear"),
                ("Blue-Black Q-Zip", "hoodies", "blue", "casual"),
                ("Navy Air-Force", "hoodies", "navy", "streetwear"),
                ("Black Zip-Up", "hoodies", "black", "casual"),
                ("Small Black Sweater", "hoodies", "black", "smart"),
                ("White T-shirt", "shirts", "white", "casual"),
                ("Black T-shirt", "shirts", "black", "casual"),
                ("Gray Berkely shirt", "shirts", "gray", "casual"),
                ("Black Q-Button", "shirts", "black", "smart"),
                ("Gray Q-Button", "shirts", "gray", "smart"),
                ("Navy Q-Button", "shirts", "navy", "smart"),
                ("Light-Blue Baggy jeans", "pants", "blue", "streetwear"),
                ("Black Baggy jeans", "pants", "black", "streetwear"),
                ("Blue jeans", "pants", "blue", "casual"),
                ("White Nike shoes", "shoes", "white", "casual"),
                ("White-Blue Adidas shoes", "shoes", "white", "casual"),
            ]
            connection.executemany(
                """
                INSERT INTO clothes
                    (name, category, color, style)
                VALUES (?, ?, ?, ?)
                """,
                seed_clothes,
            )


initialize_database()


@app.route("/")
def friend_builder():
    return send_from_directory(app.root_path, "friend.html")


@app.route("/owner")
def owner_page():
    with get_database() as connection:
        recommendation_rows = connection.execute(
            """
            SELECT id, author, selected_items, status, created_at
            FROM recommendations
            ORDER BY id DESC
            """
        ).fetchall()
        clothes_rows = connection.execute(
            """
            SELECT id, name, category, image_filename, color, style, available
            FROM clothes
            WHERE available = 1
            """
        ).fetchall()

    clothes_by_id = {
        str(clothes["id"]): dict(clothes)
        for clothes in clothes_rows
    }
    category_labels = {
        "hoodies": "Hoodie / sweater",
        "shirts": "Shirt",
        "pants": "Pants",
        "shoes": "Shoes",
    }

    recommendations = []
    for row in recommendation_rows:
        recommendation = dict(row)
        recommendation["selected_items"] = json.loads(
            recommendation["selected_items"]
        )
        recommendation["pieces"] = [
            {
                "category": category_labels[category],
                "item": clothes_by_id.get(
                    str(item_id),
                    {"name": f"Item {item_id}", "image_filename": None},
                ),
            }
            for category, item_id in recommendation["selected_items"].items()
        ]
        recommendations.append(recommendation)

    return render_template(
        "owner.html",
        recommendations=recommendations,
    )


@app.route("/friend.js")
def friend_javascript():
    return send_from_directory(app.root_path, "friend.js")


@app.route("/owner.js")
def owner_javascript():
    return send_from_directory(app.root_path, "owner.js")


@app.route("/styles.css")
def styles():
    return send_from_directory(app.root_path, "styles.css")


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/api/clothes")
def list_clothes():
    with get_database() as connection:
        rows = connection.execute(
            """
            SELECT id, name, category, image_filename, color, style, available
            FROM clothes
            WHERE available = 1
            ORDER BY category, id
            """
        ).fetchall()

    return jsonify([dict(row) for row in rows])


@app.route("/api/recommendations", methods=["GET", "POST"])
def recommendations():
    if request.method == "GET":
        with get_database() as connection:
            rows = connection.execute(
                """
                SELECT id, author, selected_items, status, created_at
                FROM recommendations
                ORDER BY id DESC
                """
            ).fetchall()

        result = []
        for row in rows:
            item = dict(row)
            item["selected_items"] = json.loads(item["selected_items"])
            result.append(item)
        return jsonify(result)

    data = request.get_json(silent=True) or {}
    author = str(data.get("author", "")).strip() or "Anonymous friend"
    selected_items = data.get("selected_items")

    if not isinstance(selected_items, dict):
        return jsonify({"error": "Select one item from each category."}), 400

    required_categories = {"hoodies", "shirts", "pants", "shoes"}
    if not required_categories.issubset(selected_items):
        return jsonify({"error": "Select all four clothing categories."}), 400

    with get_database() as connection:
        cursor = connection.execute(
            """
            INSERT INTO recommendations (author, selected_items)
            VALUES (?, ?)
            """,
            (author, json.dumps(selected_items)),
        )

    return jsonify({"id": cursor.lastrowid, "status": "pending"}), 201


@app.route("/api/recommendations/<int:recommendation_id>/status", methods=["POST"])
def update_recommendation_status(recommendation_id):
    status = (request.form.get("status") or "").strip()

    if status not in {"approved", "rejected"}:
        if request.content_type and "application/json" in request.content_type:
            return jsonify({"error": "Status must be approved or rejected."}), 400
        return jsonify({"error": "Status must be approved or rejected."}), 400

    with get_database() as connection:
        cursor = connection.execute(
            """
            UPDATE recommendations
            SET status = ?
            WHERE id = ?
            """,
            (status, recommendation_id),
        )

    if cursor.rowcount == 0:
        if request.content_type and "application/json" in request.content_type:
            return jsonify({"error": "Recommendation not found."}), 404
        return jsonify({"error": "Recommendation not found."}), 404

    if request.form:
        return redirect(url_for("owner_page"))

    if request.content_type and "application/json" in request.content_type:
        return jsonify({"id": recommendation_id, "status": status})

    return jsonify({"id": recommendation_id, "status": status})


@app.route("/api/generate")
def generate_outfit():
    with get_database() as connection:
        clothes = connection.execute(
            """
            SELECT id, name, category, image_filename, color, style
            FROM clothes
            WHERE available = 1
            """
        ).fetchall()

    groups = {"hoodies": [], "shirts": [], "pants": [], "shoes": []}
    for item in clothes:
        groups[item["category"]].append(dict(item))

    candidates = []
    if all(groups.values()):
        for hoodie in groups["hoodies"]:
            for shirt in groups["shirts"]:
                for pants in groups["pants"]:
                    for shoes in groups["shoes"]:
                        colors = [
                            hoodie["color"],
                            shirt["color"],
                            pants["color"],
                            shoes["color"],
                        ]
                        score = 0
                        if len(set(colors)) <= 3:
                            score += 3
                        if hoodie["color"] != shirt["color"]:
                            score += 1
                        if pants["color"] in {"black", "blue", "navy", "gray"}:
                            score += 2
                        styles = {
                            hoodie["style"],
                            shirt["style"],
                            pants["style"],
                            shoes["style"],
                        }
                        if len(styles) <= 2:
                            score += 2
                        candidates.append(
                            {
                                "score": score,
                                "hoodies": hoodie,
                                "shirts": shirt,
                                "pants": pants,
                                "shoes": shoes,
                            }
                        )

    if not candidates:
        return jsonify({"error": "Add at least one available item to every category."}), 400

    best_score = max(candidate["score"] for candidate in candidates)
    best_candidates = [
        candidate for candidate in candidates if candidate["score"] == best_score
    ]

    import random
    return jsonify(random.choice(best_candidates))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
