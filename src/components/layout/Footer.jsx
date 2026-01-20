import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Karkhana.shop</h3>
            <p className="text-sm text-muted-foreground">
              Empowering local manufacturers with enterprise-grade management tools at affordable prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground">Worker Management</Link></li>
              <li><Link to="#" className="hover:text-foreground">Inventory Tracking</Link></li>
              <li><Link to="#" className="hover:text-foreground">Sales Management</Link></li>
              <li><Link to="#" className="hover:text-foreground">Salary Automation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
              <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Karkhana.shop. All rights reserved.</p>
          <p className="mt-2">Made for Bangladeshi manufacturers, shops, and showrooms</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer