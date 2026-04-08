package main

import (
	"log"
	"net/http"

	"clinic-backend/auth"
	"clinic-backend/config"
	"clinic-backend/handler"
	"clinic-backend/migration"
	"clinic-backend/service"
	"clinic-backend/store"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	migration.Run(db, cfg.AdminUsername, cfg.AdminPassword)

	// Stores
	adminStore := store.NewAdminStore(db)
	serviceStore := store.NewServiceStore(db)
	appointmentStore := store.NewAppointmentStore(db)
	invoiceStore := store.NewInvoiceStore(db)
	notifConfigStore := store.NewNotificationConfigStore(db)
	blogStore := store.NewBlogStore(db)
	campaignStore := store.NewCampaignStore(db)

	// Auth
	jwtMgr := auth.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiryHours)

	// Services
	authSvc := service.NewAuthService(adminStore, jwtMgr)
	apptSvc := service.NewAppointmentService(appointmentStore, serviceStore)
	invoiceSvc := service.NewInvoiceService(invoiceStore, appointmentStore)
	emailSvc := service.NewEmailService(notifConfigStore)
	whatsappSvc := service.NewWhatsAppService(notifConfigStore)
	notifSvc := service.NewNotificationService(emailSvc, whatsappSvc, invoiceSvc, cfg.FrontendURL)
	campaignSvc := service.NewCampaignService(campaignStore)

	// Seed notification config from env if not already in DB
	seedNotificationConfig(notifConfigStore, cfg)

	// Handlers
	authH := handler.NewAuthHandler(authSvc, adminStore)
	serviceH := handler.NewServiceHandler(serviceStore)
	apptH := handler.NewAppointmentHandler(apptSvc, notifSvc)
	invoiceH := handler.NewInvoiceHandler(invoiceSvc)
	notifH := handler.NewNotificationHandler(notifConfigStore)
	blogH := handler.NewBlogHandler(blogStore)
	campaignH := handler.NewCampaignHandler(campaignSvc)
	seoH := handler.NewSEOHandler(blogStore, cfg.FrontendURL)
	analyticsH := handler.NewAnalyticsHandler(db)

	// Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Compress(5))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/sitemap.xml", seoH.Sitemap)

	r.Route("/api", func(r chi.Router) {
		// Public endpoints
		r.Get("/services", serviceH.ListActive)
		r.Get("/slots", apptH.GetAvailableSlots)
		r.Post("/appointments", apptH.Create)
		r.Get("/appointments/{id}/confirmation", apptH.GetConfirmation)
		r.Get("/invoices/{number}", invoiceH.GetByNumber)
		r.Get("/blog", blogH.ListPublished)
		r.Get("/blog/{slug}", blogH.GetBySlug)

		// Auth
		r.Post("/auth/login", authH.Login)

		// Admin endpoints (JWT required)
		r.Route("/admin", func(r chi.Router) {
			r.Use(auth.Middleware(jwtMgr))

			r.Get("/me", authH.Me)
			r.Get("/dashboard", apptH.Dashboard)

			r.Get("/appointments", apptH.List)
			r.Post("/appointments", apptH.Create)
			r.Get("/appointments/{id}", apptH.Get)
			r.Put("/appointments/{id}", apptH.Update)

			r.Get("/services", serviceH.ListAll)
			r.Post("/services", serviceH.Create)
			r.Put("/services/{id}", serviceH.Update)
			r.Delete("/services/{id}", serviceH.Delete)
			r.Put("/services/{id}/activate", serviceH.Activate)

			r.Post("/appointments/{id}/invoice", invoiceH.Generate)
			r.Get("/invoices", invoiceH.List)
			r.Get("/invoices/{id}", invoiceH.Get)

			r.Get("/notification-config", notifH.GetConfig)
			r.Put("/notification-config", notifH.UpdateConfig)

			r.Get("/analytics/overview", analyticsH.Overview)
			r.Get("/analytics/revenue-by-service", analyticsH.RevenueByService)
			r.Get("/analytics/appointments-by-service", analyticsH.AppointmentsByService)
			r.Get("/analytics/appointments-by-status", analyticsH.AppointmentsByStatus)
			r.Get("/analytics/peak-hours", analyticsH.PeakHours)
			r.Get("/analytics/daily-appointments", analyticsH.DailyAppointments)
			r.Get("/analytics/monthly-revenue", analyticsH.MonthlyRevenue)
			r.Get("/analytics/top-patients", analyticsH.TopPatients)
			r.Get("/analytics/busiest-days", analyticsH.BusiestDays)

			r.Get("/blog", blogH.ListAll)
			r.Post("/blog", blogH.Create)
			r.Put("/blog/{id}", blogH.Update)
			r.Delete("/blog/{id}", blogH.Delete)

			r.Get("/campaigns/preview-recipients", campaignH.PreviewRecipientsFromFilters)
			r.Get("/campaigns", campaignH.List)
			r.Post("/campaigns", campaignH.Create)
			r.Get("/campaigns/{id}", campaignH.Get)
			r.Put("/campaigns/{id}", campaignH.Update)
			r.Delete("/campaigns/{id}", campaignH.Delete)
			r.Post("/campaigns/{id}/schedule", campaignH.Schedule)
			r.Get("/campaigns/{id}/preview-recipients", campaignH.PreviewRecipients)
			r.Post("/campaigns/{id}/recipients", campaignH.AddRecipient)
			r.Delete("/campaigns/{id}/recipients/{rid}", campaignH.DeleteRecipient)
		})
	})

	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(cfg.Host+":"+cfg.Port, r))
}

func seedNotificationConfig(store *store.NotificationConfigStore, cfg *config.Config) {
	if cfg.WhatsAppPhoneNumberID != "" {
		store.Set("whatsapp_phone_number_id", cfg.WhatsAppPhoneNumberID)
	}
	if cfg.WhatsAppAccessToken != "" {
		store.Set("whatsapp_access_token", cfg.WhatsAppAccessToken)
	}
	if cfg.SMTPHost != "" {
		store.Set("smtp_host", cfg.SMTPHost)
	}
	if cfg.SMTPPort != "" {
		store.Set("smtp_port", cfg.SMTPPort)
	}
	if cfg.SMTPUsername != "" {
		store.Set("smtp_username", cfg.SMTPUsername)
	}
	if cfg.SMTPPassword != "" {
		store.Set("smtp_password", cfg.SMTPPassword)
	}
	if cfg.SMTPFrom != "" {
		store.Set("smtp_from", cfg.SMTPFrom)
	}
}
