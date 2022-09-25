from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/recipe-url", methods=["POST"])
def recipe_url():
    data = request.get_json()
    if not 'url' in data:
        return {'error': 'URL not found in data!'}
    url = data['url']
    page = requests.get(url)
    if page.status_code != 200:
        print(page.status_code)
        return {'error': 'URL is unreachable'}
    soup = BeautifulSoup(page.content, 'html.parser')
    print(soup)
    return {'url': url}