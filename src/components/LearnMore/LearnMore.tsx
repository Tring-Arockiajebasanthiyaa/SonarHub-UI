import React, { useState, useEffect } from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';
import './LearnMore.css';

const LearnMore: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveKey('github-commands');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="learn-more-container dark-theme">
      <h1 className="text-center mb-5 animate-fade-in">
        <i className="fas fa-book-open me-2"></i>DevOps Knowledge Hub
      </h1>

      <div className="row g-4">
       
        <div className="col-md-6">
          <Card className="learn-card animate-slide-up">
            <Card.Header>
              <h2><i className="fab fa-github me-2"></i>GitHub Essentials</h2>
            </Card.Header>
            <Card.Body>
              <Accordion activeKey={activeKey} onSelect={(e) => setActiveKey(e as string)}>
                <Accordion.Item eventKey="github-commands" className="mb-3">
                  <Accordion.Header>Essential GitHub Commands</Accordion.Header>
                  <Accordion.Body>
                    <pre className="code-block">
                      <code>
{`# Clone repository
git clone https://github.com/user/repo.git

# Create new branch
git checkout -b feature-branch

# Stage changes
git add .

# Commit changes
git commit -m "Descriptive message"

# Push to remote
git push origin feature-branch

# Resolve merge conflicts
git mergetool
git commit -m "Resolved conflicts"`}
                      </code>
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="github-issues" className="mb-3">
                  <Accordion.Header>Common GitHub Issues & Fixes</Accordion.Header>
                  <Accordion.Body>
                    <ul className="issue-list">
                      <li>
                        <strong>Permission denied (publickey)</strong>
                        <p>Solution: Generate new SSH key and add to GitHub</p>
                        <pre className="code-block">
                          <code>
{`ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519`}
                          </code>
                        </pre>
                      </li>
                      <li>
                        <strong>Merge conflicts</strong>
                        <p>Solution: Use git mergetool or manually edit conflicted files</p>
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="learn-card animate-slide-up delay-1">
            <Card.Header>
              <h2><i className="fas fa-bug me-2"></i>SonarQube Solutions</h2>
            </Card.Header>
            <Card.Body>
              <Accordion activeKey={activeKey} onSelect={(e) => setActiveKey(e as string)}>
                <Accordion.Item eventKey="sonar-commands" className="mb-3">
                  <Accordion.Header>SonarQube Commands</Accordion.Header>
                  <Accordion.Body>
                    <pre className="code-block">
                      <code>
{`# Run SonarScanner
dotnet sonarscanner begin /k:"project-key" /d:sonar.login=your_token
dotnet build
dotnet sonarscanner end /d:sonar.login=your_token

# Docker commands
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Check SonarQube status
curl -u admin:admin http://localhost:9000/api/system/status`}
                      </code>
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="sonar-issues" className="mb-3">
                  <Accordion.Header>SonarQube Issues & Fixes</Accordion.Header>
                  <Accordion.Body>
                    <ul className="issue-list">
                      <li>
                        <strong>ECONNREFUSED on port 9000</strong>
                        <p>Solution: Ensure SonarQube is running and check firewall settings</p>
                        <pre className="code-block">
                          <code>
{`# Check if SonarQube is running
docker ps -a

# Start SonarQube if stopped
docker start sonarqube

# Check logs for errors
docker logs sonarqube`}
                          </code>
                        </pre>
                      </li>
                      <li>
                        <strong>Quality Gate failure</strong>
                        <p>Solution: Address critical bugs and vulnerabilities first</p>
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="quick-actions animate-fade-in delay-2">
        <h3 className="text-center my-4"><i className="fas fa-bolt me-2"></i>Quick Actions</h3>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="outline-primary" onClick={() => setActiveKey('github-commands')}>
            <i className="fab fa-github me-2"></i>GitHub Cheatsheet
          </Button>
          <Button variant="outline-success" onClick={() => setActiveKey('sonar-commands')}>
            <i className="fas fa-bug me-2"></i>SonarQube Reference
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;