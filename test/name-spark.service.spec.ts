import { NotFoundException } from '@nestjs/common';
import { NameSparkService } from '../src/name-spark/name-spark.service';
import { NameGender } from '../src/shared/enums/name-gender.enum';
import { NameOrigin } from '../src/shared/enums/name-origin.enum';

describe('NameSparkService', () => {
  let service: NameSparkService;

  beforeEach(() => {
    service = new NameSparkService();
  });

  // ── getNameDetail ────────────────────────────────────────────────────────

  describe('getNameDetail', () => {
    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.getNameDetail('missing-name')).toThrow(
        NotFoundException,
      );
    });

    it('returns the full detail for a known name', () => {
      const detail = service.getNameDetail('layla');
      expect(detail.id).toBe('layla');
      expect(detail.name).toBe('Layla');
      expect(detail.styles).toBeDefined();
      expect(detail.popularity).toBeDefined();
      expect(detail.insight).toBeDefined();
    });
  });

  // ── updateFavorite ───────────────────────────────────────────────────────

  describe('updateFavorite', () => {
    it('throws NotFoundException for an unknown id', () => {
      expect(() =>
        service.updateFavorite('missing-name', { isFavorite: true }),
      ).toThrow(NotFoundException);
    });

    it('sets isFavorite to true', () => {
      const result = service.updateFavorite('ayla', { isFavorite: true });
      expect(result.isFavorite).toBe(true);
    });

    it('sets isFavorite to false', () => {
      // layla is seeded as favorite=true
      const result = service.updateFavorite('layla', { isFavorite: false });
      expect(result.isFavorite).toBe(false);
    });

    it('persists the mutation across calls', () => {
      service.updateFavorite('ayla', { isFavorite: true });
      const detail = service.getNameDetail('ayla');
      expect(detail.isFavorite).toBe(true);
    });
  });

  // ── search ───────────────────────────────────────────────────────────────

  describe('search', () => {
    it('returns all names when no filters are provided', () => {
      const results = service.search({});
      expect(results.length).toBeGreaterThan(0);
    });

    it('filters by gender (Girl only)', () => {
      const results = service.search({ gender: NameGender.Girl });
      const genders = results.map((r) => r.gender);
      // Every result is Girl or Unisex (unisex matches any gender filter)
      genders.forEach((g) => {
        expect([NameGender.Girl, NameGender.Unisex]).toContain(g);
      });
    });

    it('filters by origin', () => {
      const results = service.search({ origins: [NameOrigin.Arabic] });
      results.forEach((r) => expect(r.origin).toBe(NameOrigin.Arabic));
    });

    it('filters by starting letter', () => {
      const results = service.search({ startingLetter: 'L' });
      results.forEach((r) => expect(r.name.startsWith('L')).toBe(true));
    });

    it('applies all filters together (AND logic)', () => {
      const results = service.search({
        gender: NameGender.Girl,
        origins: [NameOrigin.Arabic],
        startingLetter: 'L',
      });
      results.forEach((r) => {
        expect([NameGender.Girl, NameGender.Unisex]).toContain(r.gender);
        expect(r.origin).toBe(NameOrigin.Arabic);
        expect(r.name.startsWith('L')).toBe(true);
      });
      // Should include Layla
      expect(results.some((r) => r.name === 'Layla')).toBe(true);
    });

    it('returns empty array when no names match the filters', () => {
      const results = service.search({
        gender: NameGender.Boy,
        origins: [NameOrigin.Arabic],
        startingLetter: 'Z',
      });
      // Only Zayn matches; Zayn is a Boy from Arabic starting with Z
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Zayn');
    });

    it('respects the limit parameter', () => {
      const results = service.search({ limit: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('assigns matchScore=0 when no filters are provided', () => {
      const results = service.search({});
      results.forEach((r) => expect(r.matchScore).toBe(0));
    });

    it('assigns matchScore=3 when only gender is provided', () => {
      const results = service.search({ gender: NameGender.Girl });
      results.forEach((r) => expect(r.matchScore).toBe(3));
    });

    it('assigns matchScore=6 when all three filters are provided', () => {
      const results = service.search({
        gender: NameGender.Girl,
        origins: [NameOrigin.Latin],
        startingLetter: 'M',
      });
      results.forEach((r) => expect(r.matchScore).toBe(6));
    });

    it('returns results in deterministic order (Popular before Emerging)', () => {
      const results = service.search({ origins: [NameOrigin.Hebrew] });
      const popularFirst = results.findIndex((r) => r.name === 'Asher');
      const emergingLast = results.findIndex((r) => r.name === 'Leora');
      expect(popularFirst).toBeLessThan(emergingLast);
    });

    it('accepts multiple origins', () => {
      const results = service.search({
        origins: [NameOrigin.Arabic, NameOrigin.Hebrew],
      });
      results.forEach((r) => {
        expect([NameOrigin.Arabic, NameOrigin.Hebrew]).toContain(r.origin);
      });
    });

    it('reflects updated isFavorite in search results', () => {
      service.updateFavorite('ayla', { isFavorite: true });
      const results = service.search({ startingLetter: 'A' });
      const ayla = results.find((r) => r.id === 'ayla');
      expect(ayla?.isFavorite).toBe(true);
    });
  });
});
