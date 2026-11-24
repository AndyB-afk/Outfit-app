from flask import Flask, send_from_directory


app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory(app.root_path, "index.html")


@app.route("/styles.css")
def styles():
    return send_from_directory(app.root_path, "styles.css")


@app.route("/app.js")
def javascript():
    return send_from_directory(app.root_path, "app.js")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
