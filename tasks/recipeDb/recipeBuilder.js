import { distinct, except } from "../../src/utility/array";
import equivalentItems from "../../data/equivalentItems";
import highPriorityComponents from "../../data/highPriorityComponents";

function RecipeBuilder() {
  this._db = {};
}

RecipeBuilder.prototype._parseEntry = function parseEntry(recipe) {
  let componentIds = [];
  let dbEntry = {
    itemId: recipe.output_item_id,
    count: recipe.output_item_count,
    components: recipe.ingredients.map(ingredient => {
      let itemId = ingredient.item_id;
      let result = {
        itemId,
        count: ingredient.count
      };

      let equivalentTo = equivalentItems[itemId];
      if (equivalentTo) {
        result.itemId = equivalentTo;
        result.substitutionFor = itemId;

        console.log("Substituted item " + equivalentTo + " for " + itemId);
      }

      componentIds.push(String(result.itemId));

      return result;
    })
  };

  let sortedComponents = dbEntry.components.filter(
    o => highPriorityComponents.indexOf(o.itemId) > -1
  );
  sortedComponents = sortedComponents.concat(
    except(dbEntry.components, sortedComponents)
  );
  dbEntry.components = sortedComponents;

  return {
    componentIds,
    dbEntry
  };
};

RecipeBuilder.prototype.record = function record(recipes) {
  let newItems = [];

  recipes.forEach(recipe => {
    let entry = this._parseEntry(recipe);

    newItems = newItems.concat(entry.componentIds);

    this._db[entry.dbEntry.itemId] = entry.dbEntry;

    console.log(
      "Recorded recipe " +
        recipe.id +
        " for item " +
        recipe.output_item_id +
        " with " +
        entry.dbEntry.components.length +
        " components"
    );
  });

  newItems = except(distinct(newItems), Object.keys(recipes));

  return newItems;
};

RecipeBuilder.prototype.results = function results() {
  return this._db;
};

export default RecipeBuilder;
