"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NameSparkService = void 0;
const common_1 = require("@nestjs/common");
const name_seed_1 = require("./data/name-seed");
const POPULARITY_RANK = {
    Popular: 3,
    Steady: 2,
    Emerging: 1,
};
function cloneSeedNames() {
    return name_seed_1.nameSeed.map((item) => ({
        ...item,
        styles: [...item.styles],
    }));
}
let NameSparkService = class NameSparkService {
    constructor() {
        this.names = cloneSeedNames();
    }
    search(input) {
        const { gender, origins, startingLetter, limit } = input;
        const filtered = this.names.filter((name) => {
            if (gender && name.gender !== gender && name.gender !== 'unisex') {
                return false;
            }
            if (origins && origins.length > 0 && !origins.includes(name.origin)) {
                return false;
            }
            if (startingLetter && !name.name.startsWith(startingLetter)) {
                return false;
            }
            return true;
        });
        const matchScore = (gender ? 3 : 0) +
            (origins && origins.length > 0 ? 2 : 0) +
            (startingLetter ? 1 : 0);
        const sorted = [...filtered].sort((a, b) => {
            const rankDiff = (POPULARITY_RANK[b.popularity] ?? 0) -
                (POPULARITY_RANK[a.popularity] ?? 0);
            return rankDiff !== 0 ? rankDiff : a.name.localeCompare(b.name);
        });
        const results = sorted.map((name) => this.toSearchResult(name, matchScore));
        return limit ? results.slice(0, limit) : results;
    }
    getNameDetail(id) {
        const name = this.findNameOrThrow(id);
        return this.toDetail(name);
    }
    updateFavorite(id, input) {
        const name = this.findNameOrThrow(id);
        name.isFavorite = input.isFavorite;
        return this.toDetail(name);
    }
    findNameOrThrow(id) {
        const name = this.names.find((entry) => entry.id === id);
        if (!name) {
            throw new common_1.NotFoundException(`Name ${id} was not found.`);
        }
        return name;
    }
    toSearchResult(name, matchScore) {
        return {
            id: name.id,
            name: name.name,
            meaning: name.meaning,
            gender: name.gender,
            origin: name.origin,
            matchScore,
            isFavorite: name.isFavorite,
        };
    }
    toDetail(name) {
        return {
            ...name,
            styles: [...name.styles],
        };
    }
};
exports.NameSparkService = NameSparkService;
exports.NameSparkService = NameSparkService = __decorate([
    (0, common_1.Injectable)()
], NameSparkService);
//# sourceMappingURL=name-spark.service.js.map