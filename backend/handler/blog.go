package handler

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"clinic-backend/model"
	"clinic-backend/store"

	"github.com/go-chi/chi/v5"
)

type BlogHandler struct {
	blogStore *store.BlogStore
}

func NewBlogHandler(blogStore *store.BlogStore) *BlogHandler {
	return &BlogHandler{blogStore: blogStore}
}

func (h *BlogHandler) ListPublished(w http.ResponseWriter, r *http.Request) {
	posts, err := h.blogStore.ListPublished()
	if err != nil {
		writeError(w, "failed to fetch blog posts", http.StatusInternalServerError)
		return
	}
	writeJSON(w, posts, http.StatusOK)
}

func (h *BlogHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.blogStore.GetBySlug(slug)
	if err != nil {
		writeError(w, "blog post not found", http.StatusNotFound)
		return
	}
	writeJSON(w, post, http.StatusOK)
}

func (h *BlogHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	posts, err := h.blogStore.ListAll()
	if err != nil {
		writeError(w, "failed to fetch blog posts", http.StatusInternalServerError)
		return
	}
	writeJSON(w, posts, http.StatusOK)
}

func (h *BlogHandler) Create(w http.ResponseWriter, r *http.Request) {
	var post model.BlogPost
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if post.Title == "" || post.Content == "" {
		writeError(w, "title and content are required", http.StatusBadRequest)
		return
	}

	if post.Slug == "" {
		post.Slug = slugify(post.Title)
	}

	if err := h.blogStore.Create(&post); err != nil {
		writeError(w, "failed to create blog post", http.StatusInternalServerError)
		return
	}
	writeJSON(w, post, http.StatusCreated)
}

func (h *BlogHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	existing, err := h.blogStore.GetByID(id)
	if err != nil {
		writeError(w, "blog post not found", http.StatusNotFound)
		return
	}

	var req model.BlogPost
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.Title != "" {
		existing.Title = req.Title
	}
	if req.Slug != "" {
		existing.Slug = req.Slug
	}
	if req.Summary != "" {
		existing.Summary = req.Summary
	}
	if req.Content != "" {
		existing.Content = req.Content
	}
	if req.Image != "" {
		existing.Image = req.Image
	}
	if req.MetaTitle != "" {
		existing.MetaTitle = req.MetaTitle
	}
	if req.MetaDescription != "" {
		existing.MetaDescription = req.MetaDescription
	}
	if req.MetaKeywords != "" {
		existing.MetaKeywords = req.MetaKeywords
	}
	if req.Author != "" {
		existing.Author = req.Author
	}
	existing.Published = req.Published

	if err := h.blogStore.Update(existing); err != nil {
		writeError(w, "failed to update blog post", http.StatusInternalServerError)
		return
	}
	writeJSON(w, existing, http.StatusOK)
}

func (h *BlogHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := urlParamUint(r, "id")
	if err := h.blogStore.Delete(id); err != nil {
		writeError(w, "failed to delete blog post", http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]string{"message": "blog post deleted"}, http.StatusOK)
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	s = reg.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	return s
}
