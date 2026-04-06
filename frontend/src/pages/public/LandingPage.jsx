import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Clock, MapPin, Shield, ChevronDown, ChevronUp, Star, Award, Users, HeartPulse } from 'lucide-react';
import { getCached } from '../../api/cache';

const doctors = [
  {
    name: 'To be updated',
    qualification: 'BDS, MDS',
    specialization: 'General & Cosmetic Dentistry',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    description: 'Experienced in preventive care, cosmetic procedures, and advanced dental treatments.',
  },
  {
    name: 'To be updated',
    qualification: 'BDS, MDS - Orthodontics',
    specialization: 'Orthodontics & Aligners',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    description: 'Specialist in braces, aligners, and smile correction treatments.',
  },
  {
    name: 'To be updated',
    qualification: 'BDS, MDS - Oral Surgery',
    specialization: 'Oral Surgery & Implants',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face',
    description: 'Expert in surgical extractions, dental implants, and reconstructive procedures.',
  },
];

const testimonials = [
  {
    name: 'Priya R.',
    rating: 5,
    text: 'Excellent experience at Big Smile Dental Care. The doctor was very patient and explained every step of the treatment. Highly recommend!',
    service: 'Root Canal Treatment',
  },
  {
    name: 'Arjun M.',
    rating: 5,
    text: 'Very clean and hygienic clinic. The sterilization process they follow gave me a lot of confidence. My teeth cleaning was painless.',
    service: 'Teeth Cleaning',
  },
  {
    name: 'Kavya S.',
    rating: 5,
    text: 'Got my cosmetic dental work done here. The results are amazing and the staff is very friendly and professional.',
    service: 'Cosmetic Dentistry',
  },
  {
    name: 'Ravi K.',
    rating: 4,
    text: 'Good clinic with modern equipment. The appointment booking was smooth and there was minimal waiting time.',
    service: 'Consultation',
  },
];

const leftFaqs = [
  {
    q: 'How often should I visit the dentist?',
    a: 'Dentists recommend a professional dental check-up and cleaning every 6 months for most patients. If you have specific conditions like gum disease or a history of cavities, more frequent visits may be advised. Regular check-ups at Big Smile Dental Care help detect issues early and prevent costly treatments.',
  },
  {
    q: 'What dental services does Big Smile Dental Care in Banashankari offer?',
    a: 'We offer a full range of dental services including teeth cleaning, root canal treatment, dental implants, teeth whitening, tooth extraction, cosmetic dentistry, dental braces, clear aligners, and dental fillings. We are located at SV Plaza, 80 Feet Main Road, Srinivasnagar.',
  },
  {
    q: 'Are braces or clear aligners better for teeth straightening?',
    a: 'The right choice depends on your specific dental condition. Traditional braces are more effective for complex misalignment and bite correction, while clear aligners are a discreet and comfortable option for mild to moderate cases. Our orthodontist at Big Smile Dental Care will assess your teeth and recommend the most clinically appropriate treatment during your consultation.',
  },
  {
    q: 'When should I take my child to the dentist for the first time?',
    a: 'It is recommended to take your child to the dentist by their first birthday or when the first tooth appears. Early dental visits help prevent cavities and establish healthy oral care habits from a young age.',
  },
  {
    q: 'How do I book an appointment at Big Smile Dental Care?',
    a: 'You can book an appointment at Big Smile Dental Care online through our website or by calling us directly at +91 6364562123 or 080 41683510. Our clinic is open Monday to Saturday from 9:00 AM to 6:00 PM. Same-day appointments are available subject to slot availability.',
  }
];

const rightFaqs=[
     {
    q: 'How can i reschedule or cancel my appointment',
    a: 'to be updated',
  },
  {
    q: 'What sterilization and safety measures do you follow?',
    a: 'We follow a strict 5-phase sterilization protocol at Big Smile Dental Care — chemical disinfectant wash, ultrasonic debris removal, sterilization pouch packing, internationally certified B-class autoclave sterilization, and UV chamber storage until use. All our procedures fully comply with CDC international safety and hygiene standards.',
  },
  {
    q: 'Is tooth extraction painful?',
    a: 'No. At Big Smile Dental Care, tooth extraction is not painful as it is performed under local anesthesia.  Most of our patients experience little to no pain during the procedure. Post-procedure discomfort, if any, is minimal and manageable with standard medication.',
  },
    { 
    q: 'How often should I get my teeth cleaned?',
    a: 'Professional teeth cleaning every 6 months is the standard clinical recommendation. At Big Smile Dental Care, our dentists perform thorough cleaning to remove plaque, tartar, and surface stains that regular brushing cannot eliminate. Patients with gum disease or a history of heavy tartar buildup may be advised to come in every 3 to 4 months.',
  },
  {
    q: 'Is teeth whitening safe?',
    a: 'Yes — professional teeth whitening at Big Smile Dental Care is completely safe when performed by our qualified dentists using clinically approved whitening agents. Unlike over-the-counter products, our in-clinic treatments are calibrated to your enamel sensitivity, delivering effective results without damaging tooth structure or causing long-term sensitivity.',
  },

];

const allFaqs=[...leftFaqs,...rightFaqs];

const sterilizationSteps = [
  { step: 'Phase 1', title: 'Chemical Wash', desc: 'Instruments cleaned with chemical disinfectant solution' },
  { step: 'Phase 2', title: 'Ultrasonic Cleaning', desc: 'Ultrasonic debris removal for deep cleaning' },
  { step: 'Phase 3', title: 'Packing', desc: 'Drying and sterilization pouch packing' },
  { step: 'Phase 4', title: 'Autoclave', desc: 'Internationally certified B-class autoclave sterilization' },
  { step: 'Phase 5', title: 'UV Storage', desc: 'UV chamber storage until use' },
];

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    getCached('/services').then(setServices).catch(() => {});
  }, []);

  return (
    <div>
      {/* FAQ SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": allFaqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&h=800&fit=crop"
          alt="Modern dental clinic"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          fetchPriority="high"
          width={1600}
          height={800}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-teal-300 font-semibold text-sm sm:text-base mb-3 tracking-wide uppercase">Advanced Preventive and Oral Care Center</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              Your Smile Deserves the Best Care
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              Personalized dental treatments using the latest technology and research-based practices. No one-size-fits-all approach — every patient gets care tailored to their needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/book"
                className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-teal-700 transition">
                Book Appointment
              </Link>
              <a href="tel:+916364562123"
                className="inline-flex items-center justify-center gap-2 border border-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, value: '5000+', label: 'Patients Treated' },
            { icon: Award, value: '10+', label: 'Years Experience' },
            { icon: HeartPulse, value: '15+', label: 'Treatments Offered' },
            { icon: Shield, value: '5-Phase', label: 'Sterilization Protocol' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon size={24} className="mb-2 text-teal-200" />
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-teal-200 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">What We Offer</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">Comprehensive dental care from preventive treatments to advanced cosmetic and surgical procedures.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((svc) => (
              <div key={svc.id}
                className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">{svc.name}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{svc.description}</p>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-gray-400"><Clock size={14} /> {svc.duration} mins</span>
                  <span className="font-bold text-teal-700">&#8377;{svc.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/book" className="inline-block bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800 transition">
              Book Your Service
            </Link>
          </div>
        </div>
      </section>

      {/* About / Why Choose Us */}
      <section id="about" className="py-12 sm:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=450&fit=crop"
                alt="Dental treatment at Big Smile Dental Care"
                className="rounded-xl w-full object-cover"
                loading="lazy"
                width={600}
                height={450}
              />
            </div>
            <div>
              <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">About Us</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Why Choose Big Smile Dental Care?</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our mission is to provide you with personalized care. We believe there is no such thing as a one-size-fits-all treatment. Every patient receives a tailored treatment plan using the latest dental technology and research-based practices.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Personalized Treatment Plans', desc: 'Customized care based on your unique dental needs and goals.' },
                  { title: 'Latest Dental Technology', desc: 'Advanced equipment for precise diagnosis and comfortable treatments.' },
                  { title: 'CDC-Compliant Sterilization', desc: '5-phase sterilization protocol with internationally certified B-class autoclave.' },
                  { title: 'Patient Comfort First', desc: 'Gentle approach focused on making every visit as comfortable as possible.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sterilization Protocol */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">Your Safety Matters</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">5-Phase Sterilization Protocol</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">Every instrument goes through our rigorous sterilization process meeting international standards.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {sterilizationSteps.map((s, i) => (
              <div key={i} className="text-center p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{s.title}</p>
                <p className="text-gray-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-12 sm:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">Our Team</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Meet Our Doctors</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm sm:text-base">Experienced dental professionals dedicated to your oral health.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <img src={doc.image} alt={doc.name} className="w-full h-56 sm:h-64 object-cover" loading="lazy" width={300} height={300} />
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg">{doc.name}</h3>
                  <p className="text-teal-700 text-sm font-medium">{doc.specialization}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{doc.qualification}</p>
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-12 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">What Our Patients Say</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Success Stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 sm:p-6 border border-gray-200">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={16} className={si < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-teal-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready for a Healthier Smile?</h2>
          <p className="text-teal-100 mb-8 text-sm sm:text-base">Book your appointment today and experience personalized dental care at Big Smile Dental Care.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/book" className="inline-block bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition">
              Book Appointment
            </Link>
            <a href="tel:+916364562123" className="inline-flex items-center justify-center gap-2 border border-teal-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition">
              <Phone size={18} /> +91 6364562123
            </a>
          </div>
        </div>
      </section>      

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-20 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">Have Questions?</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
           <div className="flex flex-col md:flex-row gap-4">
              {/* Left Column */}
              <div className="flex-1 space-y-4">
                {leftFaqs.map((faq, i) => {
                  return (
                    <div key={faq.q} className="bg-white rounded-xl border border-gray-200 overflow-hidden mx-3">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">
                          {faq.q}
                        </span>
                        {openFaq === i ? (
                          <ChevronUp size={18} className="text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400 shrink-0" />
                        )}
                      </button>

                      {openFaq === i && (
                        <div className="px-5 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-4">
                {rightFaqs.map((faq, i) => {
                  const index = i + leftFaqs.length; // 5–9 (IMPORTANT)
                  return (
                    <div key={faq.q} className="bg-white rounded-xl border border-gray-200 overflow-hidden mx-3">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">
                          {faq.q}
                        </span>
                        {openFaq === index ? (
                          <ChevronUp size={18} className="text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400 shrink-0" />
                        )}
                      </button>

                      {openFaq === index && (
                        <div className="px-5 pb-4">
                          <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>   
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-teal-700 font-semibold text-sm mb-2 uppercase tracking-wide">Get In Touch</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin size={24} className="mx-auto text-teal-700 mb-3" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Location</p>
              <p className="text-gray-500 text-sm">Bangalore, Karnataka</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <Phone size={24} className="mx-auto text-teal-700 mb-3" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Phone</p>
              <p className="text-gray-500 text-sm">+91 6364562123</p>
              <p className="text-gray-500 text-sm">080 41683510</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <Clock size={24} className="mx-auto text-teal-700 mb-3" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Working Hours</p>
              <p className="text-gray-500 text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-500 text-sm">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
