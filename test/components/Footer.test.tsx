import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Footer from '../../src/components/Footer'

const FooterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Footer Component', () => {
  it('renders footer with default content', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
  })

  it('renders product section links', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('renders company section links', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Careers')).toBeInTheDocument()
  })

  it('renders resources section links', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByText('Help')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Advertise')).toBeInTheDocument()
    expect(screen.getByText('Privacy')).toBeInTheDocument()
  })

  it('renders legal links', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    expect(screen.getByText('Terms and Conditions')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('renders copyright information', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })

  it('social links have correct href attributes', () => {
    render(
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    )
    
    const instagramLink = screen.getByLabelText('Instagram')
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/zia.contact')
    
    const facebookLink = screen.getByLabelText('Facebook')
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/profile.php?id=61578604951668')
    
    const emailLink = screen.getByLabelText('Email')
    expect(emailLink).toHaveAttribute('href', 'mailto:zia.contact.team@gmail.com')
    
    const linkedinLink = screen.getByLabelText('LinkedIn')
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/zia2025')
  })

  it('renders with custom props', () => {
    const customSections = [
      {
        title: 'Custom Section',
        links: [
          { name: 'Custom Link', href: '/custom' }
        ]
      }
    ]
    
    const customLogo = {
      url: '/custom',
      src: '/custom-logo.svg',
      alt: 'Custom Logo',
      title: 'Custom Title'
    }
    
    render(
      <FooterWrapper>
        <Footer sections={customSections} logo={customLogo} />
      </FooterWrapper>
    )
    
    expect(screen.getByText('Custom Section')).toBeInTheDocument()
    expect(screen.getByText('Custom Link')).toBeInTheDocument()
    expect(screen.getByAltText('Custom Logo')).toBeInTheDocument()
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('handles missing logo gracefully', () => {
    render(
      <FooterWrapper>
        <Footer logo={{ url: '/', src: '/nonexistent.svg', alt: 'Missing Logo', title: 'Missing' }} />
      </FooterWrapper>
    )
    
    // Should still render the footer structure
    expect(screen.getByText('Product')).toBeInTheDocument()
  })

  it('renders with custom description', () => {
    const customDescription = 'Custom footer description'
    
    render(
      <FooterWrapper>
        <Footer description={customDescription} />
      </FooterWrapper>
    )
    
    expect(screen.getByText(customDescription)).toBeInTheDocument()
  })
})