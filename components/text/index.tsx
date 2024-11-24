import React from "react";

const Titles = {
  H1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="h1 text-pretty mb-4 md:mb-6">{children}</h1>
  ),
  H2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="h2 text-pretty mb-4 md:mb-6">{children}</h2>
  ),
  H3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="h3 text-pretty mb-4 md:mb-6">{children}</h3>
  ),
};

const Body = {
  Default: ({ children }: { children: React.ReactNode }) => (
    <p className="body text-pretty mb-4 md:mb-6">{children}</p>
  ),
  Small: ({ children }: { children: React.ReactNode }) => (
    <small className="body-small text-pretty mb-4 md:mb-6">{children}</small>
  ),
};

export { Body, Titles };
