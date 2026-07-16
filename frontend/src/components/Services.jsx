import React from 'react';
import { Link } from 'react-router-dom';
import { ZapIcon, FactoryIcon, DropletIcon, FlameIcon, CpuIcon, ToolIcon } from './Icons';

const servicesList = [
  {
    title: 'All Electrical Works',
    icon: <ZapIcon size={32} className="text-cyan" />,
    description: 'Complete home electrical repairs and maintenance. We troubleshoot issues, fix short circuits, install ceiling fans, replace old switches, and set up light fixtures.',
    items: ['Ceiling Fan & Lights Installation', 'Switchboard Repair & Fitting', 'Short Circuit Troubleshooting', 'Home Appliance Connections']
  },
  {
    title: 'Industrial Works',
    icon: <FactoryIcon size={32} className="text-purple" />,
    description: 'Electrical and mechanical solutions tailored for factories and workshops. Includes high-voltage panel checks, motor repairs, and control wiring maintenance.',
    items: ['Control Panel Diagnostics', 'Industrial Motor Wiring', 'Generator Hookups', 'Factory Lighting & Layouts']
  },
  {
    title: 'Plumbing Works',
    icon: <DropletIcon size={32} className="text-cyan" />,
    description: 'Full-service plumbing diagnostics, installation, and repairs. We fix leaks, replace pipelines, repair motor pumps, and install bathroom/kitchen fixtures.',
    items: ['Leaky Pipes & Faucets Repair', 'Water Motor Pump Servicing', 'Drainage Line Unblocking', 'Sanitary Fittings Installation']
  },
  {
    title: 'Welding Works',
    icon: <FlameIcon size={32} className="text-purple" />,
    description: 'Durable welding and fabrication services. We handle gate repairs, metal grills, railings, and custom metal structure welding to secure your premises.',
    items: ['Metal Gate Repair & Hinges', 'Window Safety Grill Fabrication', 'Balcony Railing Welding', 'Sheet Metal Roof Installation']
  },
  {
    title: 'House Wiring',
    icon: <CpuIcon size={32} className="text-cyan" />,
    description: 'Complete electrical wiring for new buildings and renovations. We design wire paths, install MCBs/DB panels, and pull cables safely following safety standards.',
    items: ['New Duplex/Building Wiring', 'Distribution Board & MCB Setup', 'Earthing & Safety Grounding', 'Inverter & UPS Power Routing']
  }
];

const Services = () => {
  return (
    <section id="services" className="section bg-dark">
      <div className="container">
        <h2 className="section-title">Our Handyman Services</h2>
        <p className="section-subtitle">
          Professional grade craftsmanship across multiple domains. Whether it is a small house repair or a large industrial installation, we deliver high-quality work.
        </p>

        <div className="services-grid">
          {servicesList.map((service, index) => (
            <div key={index} className="service-card glass-card hover-glow">
              <div className="service-header">
                <div className="service-icon-wrapper">
                  {service.icon}
                </div>
                <h3>{service.title}</h3>
              </div>
              <p className="service-desc">{service.description}</p>
              
              <ul className="service-list">
                {service.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <span className="bullet-point"></span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="service-card-action">
                <Link to={`/book?service=${encodeURIComponent(service.title)}`} className="service-btn-link">
                  Request This Service &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
