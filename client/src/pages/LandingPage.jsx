import {LandingNavbar} from '../components/landing/Navbar';
import {Hero} from '../components/landing/Hero';
import {Stats} from '../components/landing/Stats';
import {HowItWorks} from '../components/landing/HowItWorks';
import {Features} from '../components/landing/Features';
import {Footer} from '../components/landing/Footer';
import {CTA} from '../components/landing/CTA';


const landingPage = () => {
  return( <>
      <LandingNavbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
  </>
  );
}
export default landingPage;