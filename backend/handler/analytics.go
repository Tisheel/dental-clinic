package handler

import (
	"net/http"
	"time"

	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	db *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db: db}
}

func (h *AnalyticsHandler) Overview(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	today := now.Format("2006-01-02")
	weekStart := now.AddDate(0, 0, -int(now.Weekday()-time.Monday))
	if now.Weekday() == time.Sunday {
		weekStart = now.AddDate(0, 0, -6)
	}
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")
	yearStart := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.Local).Format("2006-01-02")

	type revenueRow struct {
		Total float64
	}

	var todayRev, weekRev, monthRev, yearRev revenueRow
	h.db.Raw("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(generated_at) = ?", today).Scan(&todayRev)
	h.db.Raw("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(generated_at) >= ?", weekStart.Format("2006-01-02")).Scan(&weekRev)
	h.db.Raw("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(generated_at) >= ?", monthStart).Scan(&monthRev)
	h.db.Raw("SELECT COALESCE(SUM(total),0) as total FROM invoices WHERE DATE(generated_at) >= ?", yearStart).Scan(&yearRev)

	var totalPatients int64
	h.db.Raw("SELECT COUNT(DISTINCT phone_number) FROM appointments").Scan(&totalPatients)

	var newPatientsMonth int64
	h.db.Raw(`SELECT COUNT(DISTINCT phone_number) FROM appointments
		WHERE phone_number NOT IN (SELECT DISTINCT phone_number FROM appointments WHERE DATE(slot) < ?)
		AND DATE(slot) >= ?`, monthStart, monthStart).Scan(&newPatientsMonth)

	var totalAppointments, completedCount, cancelledCount, pendingCount int64
	h.db.Raw("SELECT COUNT(*) FROM appointments").Scan(&totalAppointments)
	h.db.Raw("SELECT COUNT(*) FROM appointments WHERE status = 'completed'").Scan(&completedCount)
	h.db.Raw("SELECT COUNT(*) FROM appointments WHERE status = 'cancelled'").Scan(&cancelledCount)
	h.db.Raw("SELECT COUNT(*) FROM appointments WHERE status = 'pending'").Scan(&pendingCount)

	var avgRevenuePerAppt float64
	if completedCount > 0 {
		h.db.Raw("SELECT COALESCE(AVG(total),0) FROM invoices").Scan(&avgRevenuePerAppt)
	}

	cancellationRate := float64(0)
	if totalAppointments > 0 {
		cancellationRate = float64(cancelledCount) / float64(totalAppointments) * 100
	}

	writeJSON(w, map[string]interface{}{
		"revenue": map[string]float64{
			"today": todayRev.Total,
			"week":  weekRev.Total,
			"month": monthRev.Total,
			"year":  yearRev.Total,
		},
		"appointments": map[string]int64{
			"total":     totalAppointments,
			"completed": completedCount,
			"cancelled": cancelledCount,
			"pending":   pendingCount,
		},
		"patients": map[string]int64{
			"total":         totalPatients,
			"newThisMonth":  newPatientsMonth,
		},
		"avgRevenuePerAppointment": avgRevenuePerAppt,
		"cancellationRate":         cancellationRate,
	}, http.StatusOK)
}

func (h *AnalyticsHandler) RevenueByService(w http.ResponseWriter, r *http.Request) {
	type row struct {
		ServiceName string  `json:"serviceName"`
		Count       int64   `json:"count"`
		Total       float64 `json:"total"`
	}
	var results []row
	h.db.Raw(`
		SELECT ds.name as service_name, COUNT(i.id) as count, COALESCE(SUM(i.total),0) as total
		FROM invoices i
		JOIN appointments a ON i.appointment_id = a.id
		JOIN dental_services ds ON a.service_id = ds.id
		GROUP BY ds.id, ds.name
		ORDER BY total DESC
	`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) AppointmentsByService(w http.ResponseWriter, r *http.Request) {
	type row struct {
		ServiceName string `json:"serviceName"`
		Count       int64  `json:"count"`
	}
	var results []row
	h.db.Raw(`
		SELECT ds.name as service_name, COUNT(a.id) as count
		FROM appointments a
		JOIN dental_services ds ON a.service_id = ds.id
		GROUP BY ds.id, ds.name
		ORDER BY count DESC
	`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) AppointmentsByStatus(w http.ResponseWriter, r *http.Request) {
	type row struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var results []row
	h.db.Raw(`SELECT status, COUNT(*) as count FROM appointments GROUP BY status`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) PeakHours(w http.ResponseWriter, r *http.Request) {
	type row struct {
		Hour  int   `json:"hour"`
		Count int64 `json:"count"`
	}
	var results []row
	h.db.Raw(`SELECT HOUR(slot) as hour, COUNT(*) as count FROM appointments WHERE status != 'cancelled' GROUP BY HOUR(slot) ORDER BY hour`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) DailyAppointments(w http.ResponseWriter, r *http.Request) {
	days := r.URL.Query().Get("days")
	if days == "" {
		days = "30"
	}

	type row struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	var results []row
	h.db.Raw(`
		SELECT DATE(slot) as date, COUNT(*) as count
		FROM appointments
		WHERE DATE(slot) >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND status != 'cancelled'
		GROUP BY DATE(slot)
		ORDER BY date
	`, days).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) MonthlyRevenue(w http.ResponseWriter, r *http.Request) {
	type row struct {
		Month string  `json:"month"`
		Total float64 `json:"total"`
		Count int64   `json:"count"`
	}
	var results []row
	h.db.Raw(`
		SELECT DATE_FORMAT(generated_at, '%Y-%m') as month, SUM(total) as total, COUNT(*) as count
		FROM invoices
		WHERE generated_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
		GROUP BY DATE_FORMAT(generated_at, '%Y-%m')
		ORDER BY month
	`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) TopPatients(w http.ResponseWriter, r *http.Request) {
	type row struct {
		UserName    string `json:"userName"`
		PhoneNumber string `json:"phoneNumber"`
		Visits      int64  `json:"visits"`
		Completed   int64  `json:"completed"`
	}
	var results []row
	h.db.Raw(`
		SELECT user_name, phone_number, COUNT(*) as visits,
			SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
		FROM appointments
		GROUP BY phone_number, user_name
		ORDER BY visits DESC
		LIMIT 10
	`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}

func (h *AnalyticsHandler) BusiestDays(w http.ResponseWriter, r *http.Request) {
	type row struct {
		Day   string `json:"day"`
		Count int64  `json:"count"`
	}
	var results []row
	h.db.Raw(`
		SELECT DAYNAME(slot) as day, COUNT(*) as count
		FROM appointments WHERE status != 'cancelled'
		GROUP BY DAYNAME(slot), DAYOFWEEK(slot)
		ORDER BY DAYOFWEEK(slot)
	`).Scan(&results)

	writeJSON(w, results, http.StatusOK)
}
