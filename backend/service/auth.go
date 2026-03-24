package service

import (
	"errors"

	"clinic-backend/auth"
	"clinic-backend/store"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	adminStore *store.AdminStore
	jwtMgr     *auth.JWTManager
}

func NewAuthService(adminStore *store.AdminStore, jwtMgr *auth.JWTManager) *AuthService {
	return &AuthService{adminStore: adminStore, jwtMgr: jwtMgr}
}

type LoginResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expiresAt"`
	Admin     struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Name     string `json:"name"`
	} `json:"admin"`
}

func (s *AuthService) Login(username, password string) (*LoginResponse, error) {
	admin, err := s.adminStore.FindByUsername(username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	token, expiresAt, err := s.jwtMgr.GenerateToken(admin.ID, admin.Username)
	if err != nil {
		return nil, errors.New("failed to generate token")
	}

	resp := &LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt.Format("2006-01-02T15:04:05Z"),
	}
	resp.Admin.ID = admin.ID
	resp.Admin.Username = admin.Username
	resp.Admin.Name = admin.Name

	return resp, nil
}
