"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var FatSecretService = new /** @class */ (function () {
    function FatSecretService() {
        this.accessToken = null;
        this.tokenExpiry = null;
        this.config = {
            clientId: process.env.FATSECRET_CLIENT_ID || '4c1be385d956400192a18f193fdd6d02',
            clientSecret: process.env.FATSECRET_CLIENT_SECRET || '21930cf5d296421db9761d92b7d2b494',
            authUrl: 'https://oauth.fatsecret.com/connect/token',
            apiUrl: 'https://platform.fatsecret.com/rest/server.api'
        };
        if (!this.config.clientId || !this.config.clientSecret) {
            console.error('❌ FatSecret API credentials not found in environment variables');
        }
    }
    /**
     * Get OAuth 2.0 access token
     */
    FatSecretService.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Return cached token if still valid
                        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                            return [2 /*return*/, this.accessToken];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        credentials = Buffer.from("".concat(this.config.clientId, ":").concat(this.config.clientSecret)).toString('base64');
                        return [4 /*yield*/, axios_1.default.post(this.config.authUrl, 'grant_type=client_credentials&scope=basic', {
                                headers: {
                                    'Authorization': "Basic ".concat(credentials),
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        this.accessToken = response.data.access_token;
                        // Set expiry to 5 minutes before actual expiry for safety
                        this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
                        return [2 /*return*/, this.accessToken];
                    case 3:
                        error_1 = _a.sent();
                        console.error('FatSecret authentication error:', error_1);
                        throw new Error('Failed to authenticate with FatSecret API');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make authenticated request to FatSecret API
     */
    FatSecretService.prototype.makeRequest = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            var token, requestParams, response, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        requestParams = new URLSearchParams(__assign({ method: method, format: 'json' }, params));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.post(this.config.apiUrl, requestParams.toString(), {
                                headers: {
                                    'Authorization': "Bearer ".concat(token),
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            })];
                    case 3:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 4:
                        error_2 = _b.sent();
                        console.error("FatSecret API error (".concat(method, "):"), ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                        throw new Error("FatSecret API request failed: ".concat(method));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for recipes
     */
    FatSecretService.prototype.searchRecipes = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, maxResults) {
            var response, recipes, error_3;
            if (maxResults === void 0) { maxResults = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If credentials are missing, short-circuit and return an empty array so dev frontend doesn't get a 500
                        if (!this.config.clientId || !this.config.clientSecret) {
                            console.warn('FatSecret credentials missing - searchRecipes will return empty results in dev');
                            return [2 /*return*/, []];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest('recipes.search.v3', {
                                search_expression: query,
                                max_results: maxResults
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.recipes || !response.recipes.recipe) {
                            return [2 /*return*/, []];
                        }
                        recipes = Array.isArray(response.recipes.recipe)
                            ? response.recipes.recipe
                            : [response.recipes.recipe];
                        return [2 /*return*/, recipes];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Recipe search error:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get detailed recipe information
     */
    FatSecretService.prototype.getRecipe = function (recipeId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.clientId || !this.config.clientSecret) {
                            console.warn('FatSecret credentials missing - getRecipe will return null in dev');
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest('recipe.get.v2', {
                                recipe_id: recipeId
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.recipe || null];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Get recipe error:', error_4);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Search for foods/ingredients
     */
    FatSecretService.prototype.searchFoods = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, maxResults) {
            var response, foods, error_5;
            if (maxResults === void 0) { maxResults = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.clientId || !this.config.clientSecret) {
                            console.warn('FatSecret credentials missing - searchFoods will return empty results in dev');
                            return [2 /*return*/, []];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest('foods.search', {
                                search_expression: query,
                                max_results: maxResults
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.foods || !response.foods.food) {
                            return [2 /*return*/, []];
                        }
                        foods = Array.isArray(response.foods.food)
                            ? response.foods.food
                            : [response.foods.food];
                        return [2 /*return*/, foods];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Food search error:', error_5);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get detailed food information
     */
    FatSecretService.prototype.getFood = function (foodId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.clientId || !this.config.clientSecret) {
                            console.warn('FatSecret credentials missing - getFood will return null in dev');
                            return [2 /*return*/, null];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest('food.get.v4', {
                                food_id: foodId
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.food || null];
                    case 3:
                        error_6 = _a.sent();
                        console.error('Get food error:', error_6);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert FatSecret recipe to our Recipe model format
     */
    FatSecretService.prototype.convertToRecipeModel = function (fatSecretRecipe) {
        var _this = this;
        // Defensive parsing: guard against missing nested fields and unexpected shapes
        var ingredientsArray = fatSecretRecipe.ingredients && fatSecretRecipe.ingredients.ingredient
            ? (Array.isArray(fatSecretRecipe.ingredients.ingredient)
                ? fatSecretRecipe.ingredients.ingredient
                : [fatSecretRecipe.ingredients.ingredient])
            : [];
        var directionsArray = fatSecretRecipe.directions && fatSecretRecipe.directions.direction
            ? (Array.isArray(fatSecretRecipe.directions.direction)
                ? fatSecretRecipe.directions.direction
                : [fatSecretRecipe.directions.direction])
            : [];
        var safeParseInt = function (v, fallback) {
            if (fallback === void 0) { fallback = 0; }
            var n = parseInt(String(v || ''));
            return Number.isNaN(n) ? fallback : n;
        };
        var safeParseFloat = function (v, fallback) {
            if (fallback === void 0) { fallback = 0; }
            var n = parseFloat(String(v || ''));
            return Number.isNaN(n) ? fallback : n;
        };
        var servings = safeParseInt(fatSecretRecipe.number_of_servings, 1);
        var cookingTime = safeParseInt(fatSecretRecipe.cooking_time_min, 30);
        return {
            _id: "fatsecret_".concat(fatSecretRecipe.recipe_id),
            title: fatSecretRecipe.recipe_name || 'Untitled Recipe',
            description: fatSecretRecipe.recipe_description || undefined,
            imageUrl: fatSecretRecipe.recipe_image || undefined,
            cuisine: 'various', // FatSecret doesn't provide cuisine type
            mealType: 'dinner', // Default can be inferred or set by user
            difficulty: 'beginner', // Default
            prepTime: 0, // FatSecret doesn't provide prep time separately
            cookTime: cookingTime,
            totalTime: cookingTime,
            servings: servings,
            ingredients: ingredientsArray.map(function (ing) { return ({
                openFoodFactsId: ing.food_id || undefined,
                name: ing.food_name || 'Ingredient',
                amount: safeParseFloat(ing.number_of_units, 1),
                unit: {
                    type: 'imperial',
                    value: _this.normalizeUnit(ing.measurement_description || '')
                },
                category: 'other', // Would need to categorize
                nutritionInfo: {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    fiber: 0,
                    sugar: 0,
                    sodium: 0
                }
            }); }),
            instructions: directionsArray.map(function (dir) { return ({
                stepNumber: safeParseInt(dir.direction_number, 0),
                instruction: dir.direction_description || '',
                equipment: []
            }); }),
            nutritionInfo: fatSecretRecipe.nutritional_info ? {
                calories: safeParseFloat(fatSecretRecipe.nutritional_info.calories, 0),
                protein: safeParseFloat(fatSecretRecipe.nutritional_info.protein, 0),
                carbs: safeParseFloat(fatSecretRecipe.nutritional_info.carbohydrate, 0),
                fat: safeParseFloat(fatSecretRecipe.nutritional_info.fat, 0),
                fiber: safeParseFloat(fatSecretRecipe.nutritional_info.fiber, 0),
                sugar: safeParseFloat(fatSecretRecipe.nutritional_info.sugar, 0),
                sodium: safeParseFloat(fatSecretRecipe.nutritional_info.sodium, 0)
            } : {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
            },
            estimatedCostPerServing: 5, // Default estimate
            dietaryTags: [],
            source: 'fatsecret',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    };
    /**
     * Normalize measurement units to our standard units
     */
    FatSecretService.prototype.normalizeUnit = function (measurement) {
        var unitMap = {
            'cup': 'cups',
            'cups': 'cups',
            'tablespoon': 'tbsp',
            'tbsp': 'tbsp',
            'teaspoon': 'tsp',
            'tsp': 'tsp',
            'ounce': 'ounces',
            'oz': 'ounces',
            'pound': 'pounds',
            'lb': 'pounds',
            'gram': 'grams',
            'g': 'grams',
            'kilogram': 'kg',
            'kg': 'kg',
            'milliliter': 'ml',
            'ml': 'ml',
            'liter': 'liters',
            'l': 'liters'
        };
        var normalized = measurement.toLowerCase().trim();
        for (var _i = 0, _a = Object.entries(unitMap); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (normalized.includes(key)) {
                return value;
            }
        }
        return 'pieces'; // Default fallback
    };
    return FatSecretService;
}());
exports.default = FatSecretService;
