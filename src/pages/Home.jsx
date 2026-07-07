import Header from '../components/Header'
import Hero from '../components/Hero'
import HadithBanner from '../components/HadithBanner'
import Journey from '../components/Journey'
import CTAGrid from '../components/CTAGrid'
import Footer from '../components/Footer'
import { GoldDivider } from '../components/Ornament'

export default function Home() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HadithBanner />
        <GoldDivider />
        <Journey />
        <GoldDivider />
        <CTAGrid />
      </main>
      <Footer />
    </div>
  )
}
