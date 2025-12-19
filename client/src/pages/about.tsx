import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, Target, Heart, Zap, Shield, Users, Award } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Craftsmanship",
    description: "We take pride in precision-built solutions that stand the test of time.",
  },
  {
    icon: Shield,
    title: "Reliability",
    description: "Our clients trust us to deliver on our promises, every single time.",
  },
  {
    icon: Zap,
    title: "Clarity",
    description: "We communicate clearly and keep you informed throughout the process.",
  },
  {
    icon: Award,
    title: "Performance",
    description: "We optimize for speed, efficiency, and exceptional user experiences.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We do what's right, even when no one is watching.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We work as partners with our clients, not just service providers.",
  },
];

const team = [
  { name: "Creative Director", role: "Design Leadership" },
  { name: "Lead Developer", role: "Technical Architecture" },
  { name: "Project Manager", role: "Client Success" },
  { name: "UX Designer", role: "User Experience" },
];

export default function About() {
  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-about">
                About Us
              </Badge>
              <h1 className="font-heading font-bold text-4xl lg:text-5xl mb-6" data-testid="text-about-title">
                Building Digital
                <span className="block text-gold-gradient">Excellence</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6" data-testid="text-about-description">
                HiveCraft Digital was founded with a simple mission: to create 
                precision-built digital systems that help businesses thrive in 
                the modern digital landscape.
              </p>
              <p className="text-muted-foreground mb-8">
                We believe that great digital products are built through structure, 
                collaboration, and purpose. Our team combines technical expertise 
                with creative vision to deliver solutions that not only look 
                beautiful but perform exceptionally.
              </p>
              <Link href="/contact">
                <Button className="gap-2" data-testid="button-about-cta">
                  Work With Us
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center gold-glow">
                <div className="text-center">
                  <div className="font-heading font-bold text-7xl text-gold-gradient mb-2">5+</div>
                  <div className="text-muted-foreground text-lg">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4" data-testid="text-values-title">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index} data-testid={`card-value-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4" data-testid="text-team-title">
              Our Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experts dedicated to bringing your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center" data-testid={`card-team-${index}`}>
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-about-join-title">
            Ready to Join Our Story?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Let's work together to create something exceptional. 
            Your success is our success.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-about-join-cta">
              Start a Conversation
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
