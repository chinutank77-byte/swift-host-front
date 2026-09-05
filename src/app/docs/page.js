import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CodeBlock from "@/components/shared/CodeBlock";
import DOMAINS from "@/data/domains.json";

export const metadata = { title: "API Reference" };

const sections = [
  { id: "authentication", label: "Authentication" },
  { id: "health", label: "GET /health" },
  { id: "me", label: "GET /me" },
  { id: "create", label: "POST /create" },
  { id: "inboxes", label: "GET /inboxes" },
  { id: "inbox", label: "GET /inbox/:email" },
  { id: "message", label: "GET /message/:id" },
  { id: "attachment", label: "GET /attachment/:id" },
  { id: "stream", label: "GET /stream/:email" },
  { id: "delete-inboxes", label: "DELETE /delete-inboxes" },
  { id: "errors", label: "Errors" },
];


export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-52 shrink-0">
              <nav className="sticky top-24 glass-sm p-4 space-y-1">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-2 hero-title">
                  API Reference
                </h3>
                <ul className="space-y-0.5">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`}
                        className="block px-3 py-2 text-sm text-muted hover:text-text rounded-lg hover:bg-surface/40 transition-colors">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="flex-1 min-w-0 max-w-3xl space-y-14">
              <nav className="lg:hidden flex flex-wrap gap-2 pb-4 border-b border-border/30">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="text-xs text-muted hover:text-text px-2 py-1 rounded">
                    {s.label}
                  </a>
                ))}
              </nav>

              <section id="authentication">
                <h2 className="text-heading text-[clamp(1.4rem,3vw,1.8rem)] text-text mb-4">Authentication</h2>
                <p className="text-sm text-muted mb-4">
                  Include your API key in the <code className="font-mono text-text nm-concave-sm px-1.5 py-0.5 rounded text-xs">x-api-key</code> header. Get your key from{" "}
                  <a href="/dashboard/api-keys" className="text-accent hover:text-accent-dim font-medium">Dashboard</a>.
                </p>
                <CodeBlock
                  code={'curl https://api.swiftinbox.xyz/inboxes \\\n  -H "x-api-key: YOUR_API_KEY"'}
                  language="bash"
                />
                <p className="text-sm text-muted mt-4">
                  Base URL: <code className="font-mono text-text nm-concave-sm px-1.5 py-0.5 rounded text-xs">https://api.swiftinbox.xyz</code>
                </p>
              </section>

              <section id="health">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /health</h2>
                <p className="text-sm text-muted mb-3">No auth required.</p>
                <CodeBlock
                  code={'curl https://api.swiftinbox.xyz/health'}
                  language="bash"
                />
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "status": "ok",\n  "checks": { "database": "ok", "redis": "ok", "storage": "ok" },\n  "timestamp": "2026-07-01T13:10:49Z"\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="me">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /me</h2>
                <p className="text-sm text-muted mb-3">Returns current user or guest info. No auth needed for guest data.</p>
                <CodeBlock
                  code={'curl https://api.swiftinbox.xyz/me \\\n  -H "x-api-key: YOUR_API_KEY"'}
                  language="bash"
                />
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "ip": "103.18.35.75",\n  "type": "user",\n  "plan": "rush",\n  "active_inboxes": 3,\n  "max_inboxes": 100\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="create">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">POST /create</h2>
                <p className="text-sm text-muted mb-3">Creates one or more temporary inboxes.</p>
                <p className="text-xs text-muted mb-2">Available domains:</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {DOMAINS.map((d) => (
                    <code key={d.domain} className="text-xs font-mono text-text nm-concave-sm px-2 py-0.5 rounded">{d.domain}</code>
                  ))}
                </div>
                <CodeBlock
                  code={`curl -X POST https://api.swiftinbox.xyz/create \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d '{"count": 1, "domain": "homettown.online"}'`}
                  language="bash"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-text">Body fields:</p>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border/30"><th className="text-left py-1 pr-3 text-muted">Field</th><th className="text-left py-1 pr-3 text-muted">Type</th><th className="text-left py-1 text-muted">Description</th></tr></thead>
                    <tbody>
                      <tr><td className="py-1 pr-3 font-mono">count</td><td className="py-1 pr-3">int</td><td className="py-1">Number of inboxes (default 1)</td></tr>
                      <tr><td className="py-1 pr-3 font-mono">domain</td><td className="py-1 pr-3">string</td><td className="py-1">Specific domain</td></tr>
                      <tr><td className="py-1 pr-3 font-mono">username</td><td className="py-1 pr-3">string</td><td className="py-1">Custom username (count=1 only)</td></tr>
                      <tr><td className="py-1 pr-3 font-mono">username_length</td><td className="py-1 pr-3">int</td><td className="py-1">Random username length (3-25)</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "inboxes": [{\n    "email": "tw8avmrgui@homettown.online",\n    "domain": "homettown.online",\n    "encrypted": false,\n    "expires_at": "2026-07-01T01:36:27Z"\n  }]\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="inboxes">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /inboxes</h2>
                <p className="text-sm text-muted mb-3">Lists all inboxes for the logged-in user.</p>
                <CodeBlock
                  code={'curl https://api.swiftinbox.xyz/inboxes \\\n  -H "x-api-key: YOUR_API_KEY"'}
                  language="bash"
                />
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "inboxes": [{\n    "id": "9bb17884-...",\n    "email": "myinbox@homettown.online",\n    "domain": "homettown.online",\n    "active": true,\n    "expires_at": "2026-07-01T01:36:27",\n    "created_at": "2026-07-01T01:31:27"\n  }]\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="inbox">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /inbox/:email</h2>
                <p className="text-sm text-muted mb-3">Returns all messages in a specific inbox.</p>
                <CodeBlock
                  code={'curl "https://api.swiftinbox.xyz/inbox/myinbox@homettown.online" \\\n  -H "x-api-key: YOUR_API_KEY"'}
                  language="bash"
                />
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "messages": [{\n    "id": "48f732e8-...",\n    "sender": "noreply@someservice.com",\n    "subject": "Your code",\n    "body": "Your code is 482910",\n    "body_html": "<p>Your code is 482910</p>",\n    "otp": "482910",\n    "attachments": [],\n    "received_at": "2026-07-01T00:44:11"\n  }]\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="message">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /message/:id</h2>
                <p className="text-sm text-muted mb-3">Returns a single message by its ID.</p>
                <CodeBlock
                  code={'curl "https://api.swiftinbox.xyz/message/48f732e8-..." \\\n  -H "x-api-key: YOUR_API_KEY"'}
                  language="bash"
                />
              </section>

              <section id="attachment">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /attachment/:id</h2>
                <p className="text-sm text-muted mb-3">Downloads an attachment. Returns the raw file.</p>
                <CodeBlock
                  code={'curl "https://api.swiftinbox.xyz/attachment/398f17aa-..." \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -o document.pdf'}
                  language="bash"
                />
              </section>

              <section id="stream">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">GET /stream/:email</h2>
                <p className="text-sm text-muted mb-3">Real-time SSE stream. Pushes new messages as they arrive.</p>
                <CodeBlock
                  code={`const source = new EventSource(\n  "https://api.swiftinbox.xyz/stream/myinbox@homettown.online",\n  { headers: { "x-api-key": apiKey } }\n);\nsource.onmessage = (e) => {\n  const msg = JSON.parse(e.data);\n  console.log("new mail:", msg.subject, msg.otp);\n};`}
                  language="javascript"
                />
                <p className="text-sm text-muted mt-2">Stream interval by plan: drop=2s, spark=1.5s, rush=1s, apex=0.5s</p>
                <p className="text-sm text-muted mt-1">Pushed message shape matches <a href="#inbox" className="text-accent">GET /inbox/:email</a> message format.</p>
              </section>

              <section id="delete-inboxes">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">DELETE /delete-inboxes</h2>
                <p className="text-sm text-muted mb-3">Deletes inboxes by email list or oldest N.</p>
                <CodeBlock
                  code={`curl -X DELETE https://api.swiftinbox.xyz/delete-inboxes \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: YOUR_API_KEY" \\\n  -d '{"emails": ["myinbox@homettown.online"]}'`}
                  language="bash"
                />
                <div className="mt-2">
                  <CodeBlock
                    code={`{\n  "message": "deleted 1 inbox(es)",\n  "deleted": ["myinbox@homettown.online"]\n}`}
                    language="json"
                  />
                </div>
              </section>

              <section id="errors">
                <h2 className="text-heading text-[clamp(1.2rem,2.5vw,1.5rem)] text-text mb-2">Errors</h2>
                <div className="text-sm space-y-2">
                  <div className="flex gap-4"><code className="w-28 text-muted">401</code><span className="text-text">unauthorized</span></div>
                  <div className="flex gap-4"><code className="w-28 text-muted">403</code><span className="text-text">your ip is blocked / account suspended</span></div>
                  <div className="flex gap-4"><code className="w-28 text-muted">429</code><span className="text-text">rate limit exceeded</span></div>
                  <div className="flex gap-4"><code className="w-28 text-muted">500</code><span className="text-text">internal server error</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
