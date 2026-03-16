import { Github, Linkedin, Globe, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const developer = {
    name: "Jayanta Karmakar",
    role: "Full Stack Developer & UI/UX Designer",
    location: "India (Available Remotely Worldwide)",
    email: "jayantakarmakar998@gmail.com",
    website: "http://codebyjayanta.in/",
    github: "https://github.com/jayanta-karmakar",
    linkedin: "https://www.linkedin.com/in/jayanta-karmakar-496641140/",
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 lg:pt-40 lg:pb-32">

        <header className="mb-20">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Let's build something <br />
            extraordinary.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            I'm a passionate developer focused on creating premium digital experiences that blend high-performance code with sophisticated design.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Main Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Developer Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Location</h3>
                    <p className="text-muted-foreground">{developer.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold">Email</h3>
                    <a href={`mailto:${developer.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {developer.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">Digital Presence</h2>
              <div className="flex flex-wrap gap-4">
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                  title="Portfolio Website"
                >
                  <Globe size={24} />
                </a>
                <a
                  href={developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                  title="GitHub Profile"
                >
                  <Github size={24} />
                </a>
                <a
                  href={developer.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all shadow-sm"
                  title="LinkedIn Profile"
                >
                  <Linkedin size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Prompt */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl -z-10 rounded-full" />
            <div className="p-8 lg:p-12 rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-border shadow-2xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tight">Hire Me</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Looking for a developer to bring your vision to life? I'm available for freelance projects, collaborations, and full-time opportunities.
                </p>
              </div>

              <div className="space-y-4">
                {/* <Button 
                  asChild 
                  className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-transform active:scale-95"
                >
                  <a href={`mailto:${developer.email}`}>Send a Message</a>
                </Button> */}
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-lg font-bold border-2 transition-transform active:scale-95"
                >
                  <a href={developer.website} target="_blank" rel="noopener noreferrer">View Portfolio</a>
                </Button>
              </div>

              <div className="pt-8 border-t border-border/50">
                <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-widest">
                  Quick Response Guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
