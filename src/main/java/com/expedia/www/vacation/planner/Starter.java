package com.expedia.www.vacation.planner;

import org.springframework.boot.ResourceBanner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.core.io.DefaultResourceLoader;

@SpringBootApplication
@SuppressWarnings({"PMD.UseUtilityClass"})
public class Starter extends SpringBootServletInitializer {
  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
    builder
            .banner(new ResourceBanner(new DefaultResourceLoader().getResource("banner.txt")))
            .sources(Starter.class);

    return builder;
  }

  public static void main(String... args) throws Exception {
    SpringApplication.run(Starter.class, args);
  }
}
