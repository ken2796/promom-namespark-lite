import { Injectable, NotFoundException } from '@nestjs/common';
import { nameSeed } from './data/name-seed';
import { SearchNameSparkDto } from './dto/search-name-spark.dto';
import { UpdateNameFavoriteDto } from './dto/update-name-favorite.dto';
import { NameDetail, NameSearchResult } from './name-spark.types';

// Higher number = ranked first in results
const POPULARITY_RANK: Record<string, number> = {
  Popular: 3,
  Steady: 2,
  Emerging: 1,
};

function cloneSeedNames(): NameDetail[] {
  return nameSeed.map((item) => ({
    ...item,
    styles: [...item.styles],
  }));
}

@Injectable()
export class NameSparkService {
  private readonly names = cloneSeedNames();

  search(input: SearchNameSparkDto): NameSearchResult[] {
    const { gender, origins, startingLetter, limit } = input;

    // Hard-filter: every provided criterion must match.
    // Unisex names match any gender filter.
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

    // matchScore: sum of weights for each criterion that was provided (and
    // therefore matched, since we hard-filter). gender=3, origin=2, letter=1.
    // Tells the client how many of their preferences this name satisfies.
    const matchScore =
      (gender ? 3 : 0) +
      (origins && origins.length > 0 ? 2 : 0) +
      (startingLetter ? 1 : 0);

    // Sort by popularity tier desc, then alphabetically for a stable order.
    const sorted = [...filtered].sort((a, b) => {
      const rankDiff =
        (POPULARITY_RANK[b.popularity] ?? 0) -
        (POPULARITY_RANK[a.popularity] ?? 0);
      return rankDiff !== 0 ? rankDiff : a.name.localeCompare(b.name);
    });

    const results = sorted.map((name) => this.toSearchResult(name, matchScore));
    return limit ? results.slice(0, limit) : results;
  }

  getNameDetail(id: string): NameDetail {
    const name = this.findNameOrThrow(id);
    return this.toDetail(name);
  }

  updateFavorite(id: string, input: UpdateNameFavoriteDto): NameDetail {
    const name = this.findNameOrThrow(id);
    name.isFavorite = input.isFavorite;
    return this.toDetail(name);
  }

  private findNameOrThrow(id: string): NameDetail {
    const name = this.names.find((entry) => entry.id === id);

    if (!name) {
      throw new NotFoundException(`Name ${id} was not found.`);
    }

    return name;
  }

  protected toSearchResult(name: NameDetail, matchScore: number): NameSearchResult {
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

  protected toDetail(name: NameDetail): NameDetail {
    return {
      ...name,
      styles: [...name.styles],
    };
  }
}
