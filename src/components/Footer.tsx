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
              <li><Link href="/services/personal-care" className="text-sm text-muted-foreground hover:text-primary">Personal Care</Link></li>
              <li><Link href="/services/respite-care" className="text-sm text-muted-foreground hover:text-primary">Respite Care</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="/training" className="text-sm text-muted-foreground hover:text-primary">Learning Center</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1401 East MacDade Boulevard</li>
              <li>Folsom, Pa 19033</li>
              <li>Phone: 610-534-1414</li>
              <li>Fax: 610-534-1433</li>
              <li>Email: info@reliant.com</li>
              <li className="pt-4 font-semibold text-foreground">Counties we Service in Pennsylvania:</li>
              <li>Delaware County, Philadelphia</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Reliant Home Health Agency, Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
