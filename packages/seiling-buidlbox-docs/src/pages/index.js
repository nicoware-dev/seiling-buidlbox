import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
import CodeBlock from '@theme/CodeBlock';
import CountUp from 'react-countup';
import AOS from 'aos';
import 'aos/dist/aos.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Back to Top Button Component
function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`back-to-top ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

export default function Home() {
  useEffect(() => {
    AOS.init({ 
      once: true, 
      duration: 800,
      easing: 'ease-out-cubic',
      offset: 100
    });
  }, []);

  const videoSrc = useBaseUrl('/seilingautorun.mp4');

  const handleOneClickInstall = (event) => {
    event.preventDefault();
    const target = document.getElementById('quickstart');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout
      title="Seiling Buidlbox"
      description="No-Code Sei Multi-Agent System Development Toolkit"
    >
      <header className={styles.heroBannerAnimated}>
        <div className="container">
          <img
            src={require('@site/static/img/icon.png').default}
            alt="Seiling Buidlbox Logo"
            className={styles.heroLogo}
          />
          <h1 className={styles.heroTagline}>Build & deploy AI agents for Sei.<br/><b>No code required</b>.</h1>
          <p className={styles.heroValueProp}>The fastest way to create, automate, and scale blockchain AI agents. Open-source. Visual. Developer-first.</p>
          <div className={styles.heroButtons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/intro"
            >
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="#quickstart"
              onClick={handleOneClickInstall}
            >
              One-Click Install
            </Link>
          </div>
          <div style={{
            width: '90%',
            maxWidth: 960,
            margin: '24px auto 0',
            backgroundColor: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Terminal Title Bar */}
            <div style={{
              backgroundColor: '#2d2d2d',
              padding: '8px 16px',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {/* Terminal Buttons */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
                border: '1px solid #e0443e'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
                border: '1px solid #dea123'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#27ca3f',
                border: '1px solid #1aab29'
              }}></div>
              {/* Terminal Title */}
              <div style={{
                marginLeft: '16px',
                color: '#ccc',
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: '500'
              }}>
                Seiling Buidlbox
              </div>
            </div>
            {/* Video Container */}
            <video
              src={videoSrc}
              aria-label="Seiling Buidlbox demo video"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: '0',
              }}
            />
          </div>
        </div>
        <div className={styles.heroWave}></div>
      </header>
      <main>
        <section className={styles.quickstartSection} id="quickstart" data-aos="fade-up">
          <h2>One-Click Installation</h2>
          <div className={styles.quickstartOptions}>
            <div className={styles.quickstartCard} data-aos="fade-up" data-aos-delay="200">
              <h3>🚀 Bootstrap in Seconds</h3>
              <p className={styles.quickstartDesc}>Get started with a single command. No manual setup, no headaches.</p>
              <CodeBlock language="bash">
{`curl -sSL https://raw.githubusercontent.com/nicoware-dev/seiling-buidlbox/main/bootstrap.sh | sudo bash`}
              </CodeBlock>
              <p style={{ marginTop: 16, fontSize: '0.95em', color: '#666' }}>
                💡 <strong>Why so easy?</strong> Seiling Buidlbox automates everything: dependencies, configuration, and deployment. Just focus on building.
              </p>
              <p style={{ marginTop: 12, fontSize: '0.9em', color: '#888' }}>
                Works on any fresh VM or system. The script intelligently handles permissions and dependencies.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection} data-aos="fade-up">
          <div className="container">
            <h2>Built for the Future of Blockchain AI</h2>
            <div className={styles.statsRow}>
              <div className={styles.statCard} data-aos="fade-up" data-aos-delay="100">
                <div className={styles.statNumber}>
                  <CountUp end={12} duration={2.5} />
                </div>
                <div className={styles.statLabel}>Integrated Services</div>
              </div>
              <div className={styles.statCard} data-aos="fade-up" data-aos-delay="200">
                <div className={styles.statNumber}>
                  <CountUp end={16} duration={2.5} />+
                </div>
                <div className={styles.statLabel}>Templates, Tools & Resources</div>
              </div>
              <div className={styles.statCard} data-aos="fade-up" data-aos-delay="300">
                <div className={styles.statNumber}>
                  <CountUp end={10} duration={2.5} /> min
                </div>
                <div className={styles.statLabel}>Setup Time</div>
              </div>
              <div className={styles.statCard} data-aos="fade-up" data-aos-delay="400">
                <div className={styles.statNumber}>
                  <CountUp end={1000} duration={2.5} />+
                </div>
                <div className={styles.statLabel}>Possible Integrations</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Integrations Section */}
        <section className={styles.servicesSection} data-aos="fade-up">
          <div className="container">
            <h2>Integrated Services & Technologies</h2>
            <p className={styles.servicesDescription}>
              Production-ready services and cutting-edge technologies working together seamlessly
            </p>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="500">
                <img src={require('@site/static/img/services-icons/sei.png').default} alt="Sei Network" className={styles.serviceIcon} />
                <h4>Sei Network</h4>
                <p>High Speed Blockchain Infrastructure</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="100">
                <img src={require('@site/static/img/services-icons/openwebUI.png').default} alt="OpenWebUI" className={styles.serviceIcon} />
                <h4>OpenWebUI</h4>
                <p>Primary chat interface</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="150">
                <img src={require('@site/static/img/services-icons/n8n.png').default} alt="n8n" className={styles.serviceIcon} />
                <h4>n8n</h4>
                <p>Visual workflow builder</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="200">
                <img src={require('@site/static/img/services-icons/flowise.png').default} alt="Flowise" className={styles.serviceIcon} />
                <h4>Flowise</h4>
                <p>Visual AI agent builder</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="250">
                <img src={require('@site/static/img/services-icons/elizaos.png').default} alt="ElizaOS" className={styles.serviceIcon} />
                <h4>ElizaOS</h4>
                <p>Conversational AI framework</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="300">
                <img src={require('@site/static/img/services-icons/cambrian.png').default} alt="Cambrian" className={styles.serviceIcon} />
                <h4>Cambrian</h4>
                <p>Multi-modal agent platform</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="350">
                <img src={require('@site/static/img/services-icons/mcp.png').default} alt="Sei MCP" className={styles.serviceIcon} />
                <h4>Sei MCP</h4>
                <p>Blockchain operations</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="100">
                <img src={require('@site/static/img/services-icons/postgres.png').default} alt="PostgreSQL" className={styles.serviceIcon} />
                <h4>PostgreSQL</h4>
                <p>Relational database</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="150">
                <img src={require('@site/static/img/services-icons/redis.png').default} alt="Redis" className={styles.serviceIcon} />
                <h4>Redis</h4>
                <p>Cache & sessions</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="200">
                <img src={require('@site/static/img/services-icons/qdrant.png').default} alt="Qdrant" className={styles.serviceIcon} />
                <h4>Qdrant</h4>
                <p>Vector database</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="250">
                <img src={require('@site/static/img/services-icons/neo4j.png').default} alt="Neo4j" className={styles.serviceIcon} />
                <h4>Neo4j</h4>
                <p>Graph database</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="300">
                <img src={require('@site/static/img/services-icons/traefik.png').default} alt="Traefik" className={styles.serviceIcon} />
                <h4>Traefik</h4>
                <p>Reverse proxy</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="350">
                <img src={require('@site/static/img/services-icons/ollama.png').default} alt="Ollama" className={styles.serviceIcon} />
                <h4>Ollama</h4>
                <p>Local LLM server</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="400">
                <img src={require('@site/static/img/services-icons/docker.png').default} alt="Docker" className={styles.serviceIcon} />
                <h4>Docker</h4>
                <p>Containerization</p>
              </div>
              <div className={styles.serviceCard} data-aos="fade-up" data-aos-delay="450">
                <img src={require('@site/static/img/services-icons/bash.png').default} alt="Bash" className={styles.serviceIcon} />
                <h4>Bash Scripts</h4>
                <p>Automation tools</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2 data-aos="fade-up">Why Choose Seiling Buidlbox</h2>
          <div className={styles.bigFeaturesRow}>
            <div className={styles.bigFeatureCard} data-aos="fade-up" data-aos-delay="100">
              <span role="img" aria-label="Visual">🖥️</span>
              <h3>Visual Agent Builder</h3>
              <p>Design, connect, and deploy AI agents with drag-and-drop simplicity. No code, just creativity.</p>
            </div>
            <div className={styles.bigFeatureCard} data-aos="fade-up" data-aos-delay="200">
              <span role="img" aria-label="Lightning">⚡</span>
              <h3>Deploy in Minutes</h3>
              <p>From zero to production in under 10 minutes. Local or cloud—your choice, your workflow.</p>
            </div>
            <div className={styles.bigFeatureCard} data-aos="fade-up" data-aos-delay="300">
              <img
                src={require('@site/static/img/other-icons/sei.png').default}
                alt="Sei Network"
                className={styles.bigFeatureIcon}
              />
              <h3>Sei Blockchain Native</h3>
              <p>First-class integration with Sei Network. Automate DeFi, trading, and more with built-in tools.</p>
            </div>
            <div className={styles.bigFeatureCard} data-aos="fade-up" data-aos-delay="400">
              <span role="img" aria-label="Open Source">🌐</span>
              <h3>Open & Extensible</h3>
              <p>100% open-source. Add your own agents, connect to any API, and join the growing ecosystem.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection} data-aos="fade-up">
          <div className="container">
            <h2>Ready to Build the Future?</h2>
            <p>Experience the next generation of no-code blockchain AI development with Seiling Buidlbox.</p>
            <div className={styles.ctaButtons}>
              <Link
                className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}
                to="/docs/intro"
              >
                <span role="img" aria-label="Rocket">🚀</span>
                Start Building Now
              </Link>
              <Link
                className={`${styles.ctaButton} ${styles.ctaButtonSecondary}`}
                to="https://github.com/nicoware-dev/seiling-buidlbox"
                target="_blank"
                rel="noopener"
              >
                <span role="img" aria-label="GitHub">⭐</span>
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </Layout>
  );
} 