package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	AdminID  uint   `json:"adminId"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	secret      []byte
	expiryHours int
}

func NewJWTManager(secret string, expiryHours int) *JWTManager {
	return &JWTManager{
		secret:      []byte(secret),
		expiryHours: expiryHours,
	}
}

func (m *JWTManager) GenerateToken(adminID uint, username string) (string, time.Time, error) {
	expiresAt := time.Now().Add(time.Duration(m.expiryHours) * time.Hour)
	claims := &Claims{
		AdminID:  adminID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString(m.secret)
	return tokenStr, expiresAt, err
}

func (m *JWTManager) ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return m.secret, nil
	})
	if err != nil {
		return nil, err
	}
	return claims, nil
}
