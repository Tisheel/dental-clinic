package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"campaign-cron/config"
	"campaign-cron/processor"
	"campaign-cron/sender"

	"github.com/robfig/cron/v3"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	log.Println("Campaign cron service starting...")

	cfg := config.Load()

	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	log.Println("connected to database")

	emailSender := sender.NewEmailSender(db)
	whatsappSender := sender.NewWhatsAppSender(db)
	proc := processor.New(db, emailSender, whatsappSender)

	c := cron.New()
	// Run every 30 minutes
	c.AddFunc("*/30 * * * *", proc.Run)
	c.Start()
	log.Println("cron scheduled: campaign processor runs every 30 minutes")

	// Run once immediately on startup
	go proc.Run()

	// Wait for shutdown signal
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	log.Println("shutting down cron service...")
	c.Stop()
}
