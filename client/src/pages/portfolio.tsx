import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing/layout";
import { ArrowRight, ExternalLink, Globe, Monitor, ShoppingCart, Code2 } from "lucide-react";

const categories = [
  { id: "all", label: "All Work", icon: null },
  { id: "managed", label: "Managed Sites", icon: Globe },
  { id: "custom", label: "Custom Sites", icon: Monitor },
  { id: "stores", label: "Online Stores", icon: ShoppingCart },
  { id: "apps", label: "Web Apps", icon: Code2 },
];

const projects = [
  {
    id: "1",
    title: "TechFlow Dashboard",
    category: "apps",
    description: "A comprehensive SaaS dashboard for workflow automation",
    tags: ["React", "Node.js", "PostgreSQL"],
    imageColor: "from-blue-500/20 to-purple-500/20",
  },
  {
    id: "2",
    title: "Artisan Bakery",
    category: "managed",
    description: "Beautiful website for a local artisan bakery",
    tags: ["WordPress", "E-commerce", "SEO"],
    imageColor: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "3",
    title: "Urban Fitness",
    category: "custom",
    description: "Custom membership and booking platform for a fitness studio",
    tags: ["Next.js", "Stripe", "CMS"],
    imageColor: "from-green-500/20 to-teal-500/20",
  },
  {
    id: "4",
    title: "Luxe Interiors",
    category: "stores",
    description: "High-end furniture e-commerce with 3D product views",
    tags: ["Shopify", "3D", "Custom Theme"],
    imageColor: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "5",
    title: "HealthTrack Pro",
    category: "apps",
    description: "Patient management system for healthcare providers",
    tags: ["Vue.js", "HIPAA", "API"],
    imageColor: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "6",
    title: "Mountain Adventures",
    category: "managed",
    description: "Tour booking website for adventure travel company",
    tags: ["Booking System", "SEO", "Blog"],
    imageColor: "from-emerald-500/20 to-green-500/20",
  },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-wider" data-testid="badge-portfolio">
              Our Work
            </Badge>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl xl:text-6xl mb-6" data-testid="text-portfolio-title">
              Projects That
              <span className="block text-gold-gradient">Drive Results</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-portfolio-description">
              Explore our portfolio of precision-built digital solutions 
              across various industries.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="gap-2"
                data-testid={`button-category-${category.id}`}
              >
                {category.icon && <category.icon className="w-4 h-4" />}
                {category.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden hover-elevate cursor-pointer"
                data-testid={`card-project-${project.id}`}
              >
                <div className={`aspect-video bg-gradient-to-br ${project.imageColor} flex items-center justify-center`}>
                  <div className="w-16 h-16 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center">
                    {project.category === "apps" && <Code2 className="w-8 h-8 text-primary" />}
                    {project.category === "managed" && <Globe className="w-8 h-8 text-primary" />}
                    {project.category === "custom" && <Monitor className="w-8 h-8 text-primary" />}
                    {project.category === "stores" && <ShoppingCart className="w-8 h-8 text-primary" />}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-heading font-semibold text-lg">{project.title}</h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-card/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6" data-testid="text-portfolio-cta-title">
            Let's Build Something Great Together
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Ready to join our portfolio of successful projects? 
            Let's discuss how we can bring your vision to life.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2" data-testid="button-portfolio-cta">
              Start Your Project
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
