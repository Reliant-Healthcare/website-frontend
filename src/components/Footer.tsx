import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="relative w-40 h-12 mb-4">
              <Image 
                src="/reliant-logo.png" 
                alt="Reliant Home Health Agency" 
                fill 
                className="object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Providing compassionate, professional home health care services tailored to your individual needs.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/services/skilled-nursing" className="text-sm text-muted-foreground hover:text-primary">Skilled Nursing</Link></li>
              <li><Link href="/services/physical-therapy" className="text-sm text-muted-foreground hover:text-primary">Physical Therapy</Link></li>
              <li><Link href="/services/occupational-therapy" className="text-sm text-muted-foreground hover:text-primary">Occupational Therapy</Link></li>
              <li><Link href="/services/speech-therapy" className="text-sm text-muted-foreground hover:text-primary">Speech Therapy</Link></li>
              <li><Link href="/services/medical-social-services" className="text-sm text-muted-foreground hover:text-primary">Medical Social Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="/training" className="text-sm text-muted-foreground hover:text-primary">Training Portal</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info & Licensing</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1401 East MacDade Boulevard</li>
              <li>Folsom, PA 19033</li>
              <li><strong className="text-foreground">Office:</strong> <a href="tel:6105341414" className="hover:text-primary transition-colors">610-534-1414</a></li>
              <li><strong className="text-foreground">Fax:</strong> 610-534-1433</li>
              <li><strong className="text-foreground">Email:</strong> <a href="mailto:Reliantagency1@gmail.com" className="hover:text-primary transition-colors">Reliantagency1@gmail.com</a></li>
              <li><strong className="text-foreground">NPI Number:</strong> 1609011956</li>
              <li className="pt-2"><strong className="text-foreground">Office Hours:</strong> 9:00 AM – 5:00 PM</li>
              <li className="text-xs text-primary font-medium bg-primary/10 p-2 rounded-md border border-primary/20">
                * 24/7 After-Hours Phone Line Available<br />
                <span className="text-[11px] text-muted-foreground font-normal">(Dedicated for urgent client care outside office hours)</span>
              </li>
              <li className="pt-3 font-semibold text-foreground">Service Area:</li>
              <li className="text-xs">
                Authorized by OLTL to service <strong className="text-foreground">49 Counties in Pennsylvania</strong> including Delaware, Bucks, Montgomery, Chester, Allegheny, Lancaster, and surrounding regions.
                <br />
                <Link href="/#service-areas" className="text-primary hover:underline font-medium inline-block mt-1">
                  View All 49 Serviced Counties →
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Reliant Home Health Agency Inc. All rights reserved. | NPI: 1609011956
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
