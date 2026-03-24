package migration

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"clinic-backend/model"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Run(db *gorm.DB, adminUsername, adminPassword string) {
	err := db.AutoMigrate(
		&model.AdminUser{},
		&model.DentalService{},
		&model.Appointment{},
		&model.Invoice{},
		&model.NotificationConfig{},
		&model.BlogPost{},
	)
	if err != nil {
		log.Fatal("migration failed:", err)
	}

	seedAdmin(db, adminUsername, adminPassword)
	seedServices(db)
	seedBlogPosts(db)
	seedDummyAppointments(db)
}

func seedAdmin(db *gorm.DB, username, password string) {
	var count int64
	db.Model(&model.AdminUser{}).Count(&count)
	if count > 0 {
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("failed to hash admin password:", err)
	}

	admin := model.AdminUser{
		Username: username,
		Password: string(hashed),
		Name:     "Admin",
	}
	db.Create(&admin)
	log.Println("seeded default admin user:", username)
}

func seedServices(db *gorm.DB) {
	var count int64
	db.Model(&model.DentalService{}).Count(&count)
	if count > 0 {
		return
	}

	services := []model.DentalService{
		{Name: "Consultation", Description: "General dental consultation and examination", Duration: 30, Price: 500, Active: true},
		{Name: "Teeth Cleaning", Description: "Professional teeth cleaning and polishing", Duration: 45, Price: 1500, Active: true},
		{Name: "Tooth Filling", Description: "Composite or amalgam dental filling", Duration: 60, Price: 2000, Active: true},
		{Name: "Root Canal", Description: "Root canal treatment", Duration: 90, Price: 8000, Active: true},
		{Name: "Tooth Extraction", Description: "Simple tooth extraction", Duration: 45, Price: 3000, Active: true},
		{Name: "Teeth Whitening", Description: "Professional teeth whitening treatment", Duration: 60, Price: 5000, Active: true},
	}

	db.Create(&services)
	log.Println("seeded dental services")
}

func seedBlogPosts(db *gorm.DB) {
	var count int64
	db.Model(&model.BlogPost{}).Count(&count)
	if count > 0 {
		return
	}

	posts := []model.BlogPost{
		{
			Title:           "Why Regular Dental Check-ups Are Important",
			Slug:            "why-regular-dental-checkups-are-important",
			Summary:         "Regular dental visits help catch problems early and keep your smile healthy. Learn why you should visit your dentist every 6 months.",
			Content:         "<p>Many people only visit the dentist when they have a problem, but regular check-ups are essential for maintaining good oral health. During a routine visit, your dentist can detect early signs of cavities, gum disease, and even oral cancer.</p><h3>What Happens During a Check-up?</h3><p>A typical dental check-up includes a thorough examination of your teeth, gums, and mouth. Your dentist will look for signs of decay, check your gums for disease, and may take X-rays to see what's happening beneath the surface.</p><h3>How Often Should You Visit?</h3><p>Most dentists recommend a check-up every six months. However, depending on your oral health, your dentist may suggest more frequent visits. People with gum disease, a history of cavities, or a weakened immune system may need to visit more often.</p><h3>Benefits of Regular Visits</h3><ul><li>Early detection of dental problems</li><li>Prevention of gum disease</li><li>Professional cleaning removes plaque and tartar</li><li>Oral cancer screening</li><li>Maintaining good overall health</li></ul><p>Don't wait for a toothache to see your dentist. Schedule your regular check-up today at Big Smile Dental Care.</p>",
			Image:           "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&h=400&fit=crop",
			MetaTitle:       "Why Regular Dental Check-ups Are Important | Big Smile Dental Care Bangalore",
			MetaDescription: "Learn why regular dental check-ups every 6 months are crucial for oral health. Early detection of cavities, gum disease & oral cancer. Book at Big Smile Dental Care, Bangalore.",
			MetaKeywords:    "dental checkup Bangalore, regular dental visits, oral health checkup, dentist near me Bangalore, Big Smile Dental Care",
			Author:          "Big Smile Dental Care",
			Published:       true,
		},
		{
			Title:           "Everything You Need to Know About Teeth Whitening",
			Slug:            "everything-about-teeth-whitening",
			Summary:         "Discover the different teeth whitening options available and find out which one is right for you.",
			Content:         "<p>A bright, white smile can boost your confidence and make a great first impression. Over time, teeth can become stained from coffee, tea, wine, tobacco, and certain foods. Professional teeth whitening is a safe and effective way to restore your smile.</p><h3>Types of Teeth Whitening</h3><p><strong>In-Office Whitening:</strong> This is the fastest option. Your dentist applies a professional-grade whitening agent to your teeth and may use a special light to enhance the process. Results are visible in just one session.</p><p><strong>Take-Home Kits:</strong> Your dentist provides custom-fitted trays and professional whitening gel for you to use at home. This option takes a few weeks but offers gradual, natural-looking results.</p><h3>Is Whitening Safe?</h3><p>Professional teeth whitening performed by a dentist is safe for most people. Some patients may experience temporary sensitivity, which usually subsides within a few days.</p><h3>How Long Do Results Last?</h3><p>With proper care, professional whitening results can last 1-3 years. Avoiding stain-causing foods and drinks, and maintaining good oral hygiene will help extend your results.</p><p>Ready for a brighter smile? Book a teeth whitening consultation at Big Smile Dental Care.</p>",
			Image:           "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=400&fit=crop",
			MetaTitle:       "Teeth Whitening in Bangalore - Cost, Types & Results | Big Smile Dental Care",
			MetaDescription: "Professional teeth whitening options in Bangalore. In-office and take-home whitening kits. Safe, effective, long-lasting results. Book at Big Smile Dental Care.",
			MetaKeywords:    "teeth whitening Bangalore, professional teeth whitening, teeth whitening cost, cosmetic dentistry Bangalore",
			Author:          "Big Smile Dental Care",
			Published:       true,
		},
		{
			Title:           "Root Canal Treatment: What to Expect",
			Slug:            "root-canal-treatment-what-to-expect",
			Summary:         "Root canal treatment has a bad reputation, but modern techniques make it virtually painless. Here's what actually happens.",
			Content:         "<p>The words \"root canal\" often cause anxiety, but modern root canal treatment is a routine procedure that relieves pain rather than causing it. Understanding what to expect can help ease your concerns.</p><h3>When Is a Root Canal Needed?</h3><p>A root canal is necessary when the pulp inside your tooth becomes infected or inflamed. This can happen due to deep decay, repeated dental procedures on the tooth, a crack or chip, or trauma to the tooth.</p><h3>Signs You Might Need One</h3><ul><li>Severe toothache when chewing or applying pressure</li><li>Prolonged sensitivity to hot or cold</li><li>Darkening of the tooth</li><li>Swelling and tenderness in nearby gums</li><li>A persistent pimple on the gums</li></ul><h3>The Procedure</h3><p>During the procedure, your dentist will numb the area, remove the infected pulp, clean and shape the root canals, and fill them with a biocompatible material. The tooth is then restored with a crown for protection.</p><h3>Recovery</h3><p>Most patients can return to normal activities the next day. Some mild discomfort is normal for a few days and can be managed with over-the-counter pain medication.</p><p>If you're experiencing tooth pain, don't delay treatment. Contact Big Smile Dental Care for an evaluation.</p>",
			Image:           "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&h=400&fit=crop",
			MetaTitle:       "Root Canal Treatment in Bangalore - Painless Procedure | Big Smile Dental Care",
			MetaDescription: "Modern root canal treatment is virtually painless. Learn what to expect, signs you need one, and recovery. Expert root canal dentists at Big Smile Dental Care, Bangalore.",
			MetaKeywords:    "root canal treatment Bangalore, root canal cost, painless root canal, endodontic treatment Bangalore",
			Author:          "Big Smile Dental Care",
			Published:       true,
		},
		{
			Title:           "Caring for Your Child's Dental Health",
			Slug:            "caring-for-your-childs-dental-health",
			Summary:         "Good dental habits start early. Learn how to protect your child's teeth and set them up for a lifetime of healthy smiles.",
			Content:         "<p>Establishing good dental habits early in life sets the foundation for a lifetime of healthy smiles. As a parent, you play a crucial role in your child's oral health.</p><h3>When to Start</h3><p>Dental care should begin even before your baby's first tooth appears. Gently wipe your baby's gums with a soft, damp cloth after feedings. Once the first tooth appears, begin brushing with a soft-bristled toothbrush and a tiny smear of fluoride toothpaste.</p><h3>First Dental Visit</h3><p>The American Dental Association recommends a child's first dental visit by age 1 or within six months of the first tooth appearing. Early visits help your child become comfortable with the dentist.</p><h3>Tips for Parents</h3><ul><li>Brush your child's teeth twice a day until they can do it themselves (around age 6-7)</li><li>Limit sugary snacks and drinks</li><li>Make brushing fun with colorful toothbrushes and songs</li><li>Lead by example — let your child see you brushing and flossing</li><li>Schedule regular dental check-ups every 6 months</li></ul><h3>Common Childhood Dental Issues</h3><p>Cavities are the most common chronic childhood disease. Early detection through regular check-ups can prevent small problems from becoming big ones.</p><p>Bring your child to Big Smile Dental Care for a gentle, child-friendly dental experience.</p>",
			Image:           "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=400&fit=crop",
			MetaTitle:       "Children's Dental Care Guide | Pediatric Dentist Bangalore | Big Smile Dental Care",
			MetaDescription: "Tips for caring for your child's dental health from first tooth to teens. When to start, first dental visit guide. Child-friendly dentist in Bangalore.",
			MetaKeywords:    "pediatric dentist Bangalore, children dental care, kids dentist near me, child first dental visit",
			Author:          "Big Smile Dental Care",
			Published:       true,
		},
		{
			Title:           "The Connection Between Oral Health and Overall Health",
			Slug:            "oral-health-and-overall-health-connection",
			Summary:         "Your mouth is a window to your body's health. Learn how oral health affects your heart, diabetes, and more.",
			Content:         "<p>Your oral health is more connected to your overall health than you might think. Research has shown links between oral health problems and several systemic conditions.</p><h3>Heart Disease</h3><p>Studies suggest that gum disease may increase the risk of heart disease. The bacteria from inflamed gums can enter the bloodstream and contribute to arterial plaque buildup.</p><h3>Diabetes</h3><p>There is a two-way relationship between diabetes and gum disease. People with diabetes are more susceptible to gum disease, and severe gum disease can make it harder to control blood sugar levels.</p><h3>Respiratory Infections</h3><p>Bacteria from the mouth can be inhaled into the lungs, potentially causing respiratory infections, pneumonia, and worsening existing lung conditions.</p><h3>Pregnancy Complications</h3><p>Gum disease has been linked to premature birth and low birth weight. Pregnant women should pay special attention to their oral health.</p><h3>What You Can Do</h3><ul><li>Brush twice daily with fluoride toothpaste</li><li>Floss daily</li><li>Eat a balanced diet</li><li>Avoid tobacco products</li><li>Visit your dentist regularly</li></ul><p>Take care of your mouth, and you're taking care of your whole body. Visit Big Smile Dental Care for comprehensive oral health care.</p>",
			Image:           "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=400&fit=crop",
			MetaTitle:       "Oral Health & Overall Health Connection | Big Smile Dental Care Bangalore",
			MetaDescription: "How oral health affects heart disease, diabetes, pregnancy & more. Understand the mouth-body connection. Expert dental care at Big Smile Dental Care, Bangalore.",
			MetaKeywords:    "oral health overall health, gum disease heart disease, dental health diabetes, oral care Bangalore",
			Author:          "Big Smile Dental Care",
			Published:       true,
		},
	}

	db.Create(&posts)
	log.Println("seeded blog posts")
}

func seedDummyAppointments(db *gorm.DB) {
	var count int64
	db.Model(&model.Appointment{}).Count(&count)
	if count > 0 {
		return
	}

	var services []model.DentalService
	db.Find(&services)
	if len(services) == 0 {
		return
	}

	firstNames := []string{"Priya", "Arjun", "Kavya", "Ravi", "Sneha", "Amit", "Deepa", "Vikram", "Anita", "Suresh",
		"Meera", "Karthik", "Lakshmi", "Rahul", "Pooja", "Nikhil", "Divya", "Arun", "Swathi", "Manoj",
		"Rekha", "Sanjay", "Nandini", "Prasad", "Shweta", "Ganesh", "Bhavya", "Rajesh", "Pallavi", "Venkat"}
	lastNames := []string{"Sharma", "Reddy", "Kumar", "Nair", "Patel", "Rao", "Gupta", "Singh", "Iyer", "Joshi",
		"Hegde", "Menon", "Desai", "Bhat", "Shetty"}

	statuses := []string{model.StatusCompleted, model.StatusCompleted, model.StatusCompleted, model.StatusConfirmed, model.StatusPending, model.StatusCancelled}
	hours := []int{9, 9, 10, 10, 11, 11, 12, 14, 14, 15, 15, 16, 16, 17}

	now := time.Now()
	var appointments []model.Appointment
	invoiceNum := 0

	// Generate appointments for last 90 days + next 7 days
	for day := -90; day <= 7; day++ {
		date := now.AddDate(0, 0, day)
		if date.Weekday() == time.Sunday {
			continue
		}

		// 3-8 appointments per day
		apptCount := 3 + rand.Intn(6)
		usedHours := map[int]bool{}

		for i := 0; i < apptCount; i++ {
			// Pick a random hour that hasn't been used
			hour := hours[rand.Intn(len(hours))]
			for usedHours[hour] {
				hour = hours[rand.Intn(len(hours))]
			}
			usedHours[hour] = true

			minute := 0
			if rand.Intn(2) == 1 {
				minute = 30
			}

			svc := services[rand.Intn(len(services))]
			first := firstNames[rand.Intn(len(firstNames))]
			last := lastNames[rand.Intn(len(lastNames))]
			phone := fmt.Sprintf("+91%d", 9000000000+rand.Intn(999999999))

			status := statuses[rand.Intn(len(statuses))]
			// Future appointments should be pending or confirmed
			if day > 0 {
				if rand.Intn(2) == 0 {
					status = model.StatusPending
				} else {
					status = model.StatusConfirmed
				}
			}

			slot := time.Date(date.Year(), date.Month(), date.Day(), hour, minute, 0, 0, time.Local)

			appt := model.Appointment{
				UserName:    first + " " + last,
				PhoneNumber: phone,
				Email:       fmt.Sprintf("%s.%s@gmail.com", first, last),
				Slot:        slot,
				Duration:    svc.Duration,
				ServiceID:   svc.ID,
				Status:      status,
				CreatedAt:   slot.AddDate(0, 0, -rand.Intn(3)-1),
				UpdatedAt:   slot,
			}
			appointments = append(appointments, appt)
		}
	}

	// Batch insert
	db.CreateInBatches(&appointments, 50)
	log.Printf("seeded %d dummy appointments", len(appointments))

	// Generate invoices for completed appointments
	var completedAppts []model.Appointment
	db.Preload("Service").Where("status = ?", model.StatusCompleted).Find(&completedAppts)

	var invoices []model.Invoice
	for _, appt := range completedAppts {
		invoiceNum++
		amount := appt.Service.Price
		tax := amount * 0.18
		total := amount + tax

		invoices = append(invoices, model.Invoice{
			AppointmentID: appt.ID,
			InvoiceNumber: fmt.Sprintf("INV-%d-%04d", appt.Slot.Year(), invoiceNum),
			Amount:        amount,
			Tax:           tax,
			Total:         total,
			GeneratedAt:   appt.Slot.Add(time.Duration(appt.Duration) * time.Minute),
		})
	}

	if len(invoices) > 0 {
		db.CreateInBatches(&invoices, 50)
		log.Printf("seeded %d dummy invoices", len(invoices))
	}
}
