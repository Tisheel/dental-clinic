package service

import (
	"fmt"
	"log"

	"clinic-backend/model"
)

type NotificationService struct {
	email       *EmailService
	whatsapp    *WhatsAppService
	invoiceSvc  *InvoiceService
	frontendURL string
}

func NewNotificationService(email *EmailService, whatsapp *WhatsAppService, invoiceSvc *InvoiceService, frontendURL string) *NotificationService {
	return &NotificationService{email: email, whatsapp: whatsapp, invoiceSvc: invoiceSvc, frontendURL: frontendURL}
}

func (s *NotificationService) SendBookingConfirmation(appt *model.Appointment) {
	go func() {
		slotStr := appt.Slot.Format("02 Jan 2006 at 03:04 PM")

		waMsg := fmt.Sprintf(
			"Hello %s! Your appointment for %s has been booked on %s. Status: Pending. We will confirm shortly.",
			appt.UserName, appt.Service.Name, slotStr,
		)
		s.sendWhatsApp(appt, waMsg)

		if appt.Email != "" {
			body := fmt.Sprintf(`
				<h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Appointment Booked</h2>
				<p style="font-size:15px;color:#374151;">Dear %s,</p>
				<p style="font-size:15px;color:#374151;line-height:1.6;">Your appointment has been booked successfully. We will review and confirm it shortly.</p>
				%s
				<p style="font-size:14px;color:#6b7280;margin-top:16px;">You will receive another notification once your appointment is confirmed.</p>
			`, appt.UserName, s.appointmentDetailsHTML(appt, "Pending"))

			s.sendEmail(appt, "Appointment Booking Confirmation", body)
		}
	}()
}

func (s *NotificationService) SendStatusUpdate(appt *model.Appointment, newStatus string) {
	go func() {
		slotStr := appt.Slot.Format("02 Jan 2006 at 03:04 PM")

		switch newStatus {
		case model.StatusConfirmed:
			s.sendConfirmedNotification(appt, slotStr)
		case model.StatusCancelled:
			s.sendCancelledNotification(appt, slotStr)
		case model.StatusCompleted:
			s.sendCompletedNotification(appt, slotStr)
		}
	}()
}

func (s *NotificationService) sendConfirmedNotification(appt *model.Appointment, slotStr string) {
	waMsg := fmt.Sprintf(
		"Hello %s! Your appointment for %s on %s has been confirmed. Please arrive 10 minutes before your scheduled time.",
		appt.UserName, appt.Service.Name, slotStr,
	)
	s.sendWhatsApp(appt, waMsg)

	if appt.Email != "" {
		body := fmt.Sprintf(`
			<h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Appointment Confirmed</h2>
			<p style="font-size:15px;color:#374151;">Dear %s,</p>
			<p style="font-size:15px;color:#374151;line-height:1.6;">Your appointment has been confirmed.</p>
			%s
			<div style="margin:20px 0;padding:12px 16px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
				<p style="margin:0;font-size:14px;color:#374151;"><strong>Please note:</strong> Arrive 10 minutes before your scheduled time. Bring any relevant dental records or X-rays if available.</p>
			</div>
			<p style="font-size:14px;color:#374151;">
				<strong>Location:</strong> Bangalore, Karnataka<br/>
				<strong>Contact:</strong> +91 6364562123
			</p>
		`, appt.UserName, s.appointmentDetailsHTML(appt, "Confirmed"))

		s.sendEmail(appt, "Appointment Confirmed - "+appt.Service.Name, body)
	}
}

func (s *NotificationService) sendCancelledNotification(appt *model.Appointment, slotStr string) {
	waMsg := fmt.Sprintf(
		"Hello %s, your appointment for %s on %s has been cancelled. To reschedule, visit %s/book or contact us at +91 6364562123.",
		appt.UserName, appt.Service.Name, slotStr, s.frontendURL,
	)
	s.sendWhatsApp(appt, waMsg)

	if appt.Email != "" {
		bookingURL := s.frontendURL + "/book"
		body := fmt.Sprintf(`
			<h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Appointment Cancelled</h2>
			<p style="font-size:15px;color:#374151;">Dear %s,</p>
			<p style="font-size:15px;color:#374151;line-height:1.6;">Your appointment has been cancelled.</p>
			%s
			<p style="font-size:15px;color:#374151;line-height:1.6;">If you would like to reschedule, you can book a new appointment below.</p>
			<div style="margin:20px 0;">
				<a href="%s" style="display:inline-block;padding:10px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
					Book New Appointment
				</a>
			</div>
			<p style="font-size:14px;color:#6b7280;">We apologize for any inconvenience.</p>
		`, appt.UserName, s.appointmentDetailsHTML(appt, "Cancelled"), bookingURL)

		s.sendEmail(appt, "Appointment Cancelled - "+appt.Service.Name, body)
	}
}

func (s *NotificationService) sendCompletedNotification(appt *model.Appointment, slotStr string) {
	invoice, err := s.invoiceSvc.Generate(appt.ID)
	if err != nil {
		log.Printf("notification: failed to auto-generate invoice for appointment %d: %v", appt.ID, err)
	}

	var invoiceURL string
	if invoice != nil {
		invoiceURL = fmt.Sprintf("%s/invoice/%s", s.frontendURL, invoice.InvoiceNumber)
	}

	// WhatsApp
	waMsg := fmt.Sprintf(
		"Hello %s! Your treatment for %s on %s is now complete. Thank you for visiting Big Smile Dental Care.",
		appt.UserName, appt.Service.Name, slotStr,
	)
	if invoiceURL != "" {
		waMsg += fmt.Sprintf("\n\nInvoice %s (Total: Rs.%.2f) is ready. View and download: %s",
			invoice.InvoiceNumber, invoice.Total, invoiceURL,
		)
	}
	s.sendWhatsApp(appt, waMsg)

	// Email
	if appt.Email != "" {
		invoiceSection := ""
		if invoice != nil {
			invoiceSection = fmt.Sprintf(`
				<div style="margin:20px 0;padding:16px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;">
					<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">Invoice</p>
					<table style="width:100%%;border-collapse:collapse;font-size:14px;color:#374151;">
						<tr>
							<td style="padding:4px 0;">Invoice Number</td>
							<td style="padding:4px 0;text-align:right;font-weight:600;">%s</td>
						</tr>
						<tr>
							<td style="padding:4px 0;">Subtotal</td>
							<td style="padding:4px 0;text-align:right;">Rs. %.2f</td>
						</tr>
						<tr>
							<td style="padding:4px 0;">Tax (GST 18%%)</td>
							<td style="padding:4px 0;text-align:right;">Rs. %.2f</td>
						</tr>
						<tr>
							<td style="padding:8px 0 4px;border-top:1px solid #e5e7eb;font-weight:600;">Total</td>
							<td style="padding:8px 0 4px;border-top:1px solid #e5e7eb;text-align:right;font-weight:600;">Rs. %.2f</td>
						</tr>
					</table>
					<div style="margin-top:12px;">
						<a href="%s" style="display:inline-block;padding:10px 24px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
							View Invoice
						</a>
					</div>
				</div>
			`, invoice.InvoiceNumber, invoice.Amount, invoice.Tax, invoice.Total, invoiceURL)
		}

		body := fmt.Sprintf(`
			<h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Treatment Completed</h2>
			<p style="font-size:15px;color:#374151;">Dear %s,</p>
			<p style="font-size:15px;color:#374151;line-height:1.6;">Your treatment has been completed. We hope you had a good experience.</p>
			%s
			%s
			<p style="font-size:14px;color:#6b7280;margin-top:16px;">Thank you for choosing Big Smile Dental Care.</p>
		`, appt.UserName, s.appointmentDetailsHTML(appt, "Completed"), invoiceSection)

		s.sendEmail(appt, "Treatment Completed - Invoice Ready", body)
	}
}

func (s *NotificationService) appointmentDetailsHTML(appt *model.Appointment, status string) string {
	slotStr := appt.Slot.Format("02 Jan 2006 at 03:04 PM")
	return fmt.Sprintf(`
		<table style="width:100%%;max-width:400px;border-collapse:collapse;margin:16px 0;font-size:14px;">
			<tr>
				<td style="padding:10px 12px;color:#6b7280;background:#f9fafb;border:1px solid #e5e7eb;">Service</td>
				<td style="padding:10px 12px;color:#111827;font-weight:600;border:1px solid #e5e7eb;">%s</td>
			</tr>
			<tr>
				<td style="padding:10px 12px;color:#6b7280;border:1px solid #e5e7eb;">Date & Time</td>
				<td style="padding:10px 12px;color:#111827;font-weight:600;border:1px solid #e5e7eb;">%s</td>
			</tr>
			<tr>
				<td style="padding:10px 12px;color:#6b7280;background:#f9fafb;border:1px solid #e5e7eb;">Duration</td>
				<td style="padding:10px 12px;color:#111827;border:1px solid #e5e7eb;">%d minutes</td>
			</tr>
			<tr>
				<td style="padding:10px 12px;color:#6b7280;border:1px solid #e5e7eb;">Status</td>
				<td style="padding:10px 12px;color:#111827;font-weight:600;border:1px solid #e5e7eb;">%s</td>
			</tr>
		</table>
	`, appt.Service.Name, slotStr, appt.Duration, status)
}

func (s *NotificationService) sendWhatsApp(appt *model.Appointment, message string) {
	if err := s.whatsapp.SendText(appt.PhoneNumber, message); err != nil {
		log.Printf("notification: whatsapp failed for appointment %d: %v", appt.ID, err)
	}
}

func (s *NotificationService) sendEmail(appt *model.Appointment, subject, body string) {
	wrappedBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
		<body style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
			<div style="max-width:600px;margin:0 auto;padding:20px;">
				<div style="background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
					<!-- Header -->
					<div style="padding:24px;border-bottom:1px solid #e5e7eb;">
						<h1 style="margin:0;font-size:18px;color:#111827;font-weight:700;">Big Smile Dental Care</h1>
					</div>
					<!-- Body -->
					<div style="padding:24px;">
						%s
					</div>
				</div>
				<!-- Footer -->
				<div style="text-align:center;padding:20px 0 8px;">
					<p style="margin:0;font-size:12px;color:#9ca3af;">Big Smile Dental Care | Bangalore, Karnataka | +91 6364562123</p>
				</div>
			</div>
		</body>
		</html>
	`, body)

	if err := s.email.Send(appt.Email, subject, wrappedBody); err != nil {
		log.Printf("notification: email failed for appointment %d: %v", appt.ID, err)
	}
}
