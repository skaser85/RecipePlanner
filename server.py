from flask import Flask, render_template, request
import requests
from bs4 import BeautifulSoup
from Recipe import Recipe, recipe_exists, get_recipes, add_recipe

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/get-recipes", methods=['GET'])
def get_all_recipes():
    return {'error': '', 'recipes':  get_recipes()}

@app.route("/clear-recipes", methods=["POST"])
def clear_recipes():
    recipes.clear()
    return {'error': '', 'recipes': get_recipes()}

@app.route("/recipe-url", methods=["POST"])
def recipe_url():
    # grab the data passed into this route
    data = request.get_json()
    # check if the data contains a "url" key
    if not 'url' in data:
        return {'error': 'URL not found in data!'}
    # pull out the url
    url = data['url']
    # check if the url already exists
    if recipe_exists(url):
        return {'error': 'Recipe already exists!', 'recipes': get_recipes()}
    # check to see if we can get the html from the url
    page = requests.get(url)
    if page.status_code != 200:
        return {'error': 'URL is unreachable'}
    # parse the html from the page
    soup = BeautifulSoup(page.content, 'html.parser')
    # initialize the Recipe object
    recipe = Recipe(url)
    # get recipe name
    recipe_name = soup.find_all('h2', class_='wprm-recipe-name')
    if len(recipe_name) == 0:
        return {'error': 'Unable to parse HTMl.  Cannot find recipe name.'}
    recipe.name = recipe_name[0].text
    # get recipe description
    description = soup.find_all('div', class_='wprm-recipe-summary')
    if len(description) == 0:
        return {'error': 'Unable to parse HTML. Cannot find recipe description.'}
    recipe.description = description[0].text
    error = ''
    # get recipe ingredients
    ingredients = soup.find_all('li', class_='wprm-recipe-ingredient')
    if len(ingredients) == 0:
        return {'error': 'Unable to parse HTML. Cannot find ingredients.'}
    for ingredient in ingredients:
        success, error = recipe.add_ingredient(ingredient)
        if not success:
            return {'error': error, 'recipes':  get_recipes()}
    # get recipe instructions
    instructions = soup.find_all('div', class_='wprm-recipe-instruction-text')
    for instruction in instructions:
        success, error = recipe.add_instruction(instruction)
        if not success:
            return {'error': error, 'recipes':  get_recipes()}
    add_recipe(recipe)
    return {'error': error, 'recipes':  get_recipes()}

if __name__ == '__main__':
     app.run(host='0.0.0.0', port=8008, debug=False)