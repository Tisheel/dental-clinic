package handler

import (
	"fmt"
	"html"
	"net/http"
	"time"

	"clinic-backend/store"
)

type SEOHandler struct {
	blogStore   *store.BlogStore
	frontendURL string
}

func NewSEOHandler(blogStore *store.BlogStore, frontendURL string) *SEOHandler {
	return &SEOHandler{blogStore: blogStore, frontendURL: frontendURL}
}

func (h *SEOHandler) Sitemap(w http.ResponseWriter, r *http.Request) {
	posts, _ := h.blogStore.ListPublished()

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?>`)
	fmt.Fprint(w, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`)

	// Static pages
	pages := []struct {
		path     string
		priority string
	}{
		{"/", "1.0"},
		{"/book", "0.9"},
		{"/blog", "0.8"},
	}
	for _, p := range pages {
		fmt.Fprintf(w, `<url><loc>%s%s</loc><changefreq>weekly</changefreq><priority>%s</priority></url>`,
			h.frontendURL, p.path, p.priority)
	}

	// Blog posts
	for _, post := range posts {
		fmt.Fprintf(w, `<url><loc>%s/blog/%s</loc><lastmod>%s</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
			h.frontendURL, post.Slug, post.UpdatedAt.Format(time.RFC3339))
	}

	fmt.Fprint(w, `</urlset>`)
}

func (h *SEOHandler) BlogMetaPage(w http.ResponseWriter, r *http.Request) {
	slug := r.URL.Query().Get("slug")
	if slug == "" {
		http.Error(w, "slug required", http.StatusBadRequest)
		return
	}

	post, err := h.blogStore.GetBySlug(slug)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	title := post.MetaTitle
	if title == "" {
		title = post.Title
	}
	description := post.MetaDescription
	if description == "" {
		description = post.Summary
	}
	keywords := post.MetaKeywords
	author := post.Author
	if author == "" {
		author = "Big Smile Dental Care"
	}

	pageURL := fmt.Sprintf("%s/blog/%s", h.frontendURL, post.Slug)

	w.Header().Set("Content-Type", "application/json")
	writeJSON(w, map[string]string{
		"title":       html.EscapeString(title),
		"description": html.EscapeString(description),
		"keywords":    html.EscapeString(keywords),
		"author":      html.EscapeString(author),
		"image":       post.Image,
		"url":         pageURL,
		"published":   post.CreatedAt.Format(time.RFC3339),
		"modified":    post.UpdatedAt.Format(time.RFC3339),
	}, http.StatusOK)
}
