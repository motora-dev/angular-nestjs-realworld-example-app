import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { environment } from '$environments';
import { SeoService, SeoMetaOptions } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    const mockTitleService = {
      setTitle: vi.fn(),
    };

    const mockMetaService = {
      updateTag: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Title, useValue: mockTitleService },
        { provide: Meta, useValue: mockMetaService },
      ],
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  describe('setPageMeta', () => {
    it('should set page title with site name', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
      };

      service.setPageMeta(options);

      expect(titleService.setTitle).toHaveBeenCalledWith(expect.stringContaining('Test Page'));
      expect(titleService.setTitle).toHaveBeenCalledWith(expect.stringContaining('conduit'));
    });

    it('should set basic meta tags', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Test Description' });
    });

    it('should set Open Graph meta tags', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
        type: 'article',
        url: '/test-page',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'Test Page' });
      expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:description', content: 'Test Description' });
      expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'article' });
      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:url',
        content: `${environment.baseUrl}/test-page`,
      });
      expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:site_name', content: 'conduit' });
    });

    it('should set Twitter Card meta tags', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Test Page' });
      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'twitter:description', content: 'Test Description' });
    });

    it('should build OG image URL with title and tags', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
        tags: ['tag1', 'tag2', 'tag3'],
      };

      service.setPageMeta(options);

      const ogImageCall = vi.mocked(metaService.updateTag).mock.calls.find((call) => call[0].property === 'og:image');
      expect(ogImageCall).toBeDefined();
      if (ogImageCall) {
        expect(ogImageCall[0].content).toContain(environment.apiUrl);
        expect(ogImageCall[0].content).toContain('title=Test+Page');
        expect(ogImageCall[0].content).toContain('tags=tag1%2Ctag2%2Ctag3');
      }
    });

    it('should use provided imageUrl when available', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
        imageUrl: 'https://example.com/image.jpg',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:image',
        content: 'https://example.com/image.jpg',
      });
    });

    it('should use default type when not provided', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'website' });
    });

    it('should use baseUrl when url is not provided', () => {
      const options: SeoMetaOptions = {
        title: 'Test Page',
        description: 'Test Description',
      };

      service.setPageMeta(options);

      expect(metaService.updateTag).toHaveBeenCalledWith({
        property: 'og:url',
        content: environment.baseUrl,
      });
    });
  });

  describe('resetToDefault', () => {
    it('should reset to default metadata', () => {
      const setPageMetaSpy = vi.spyOn(service, 'setPageMeta');
      service.resetToDefault();

      expect(setPageMetaSpy).toHaveBeenCalledWith({
        title: expect.any(String),
        description: expect.any(String),
      });
    });
  });
});
