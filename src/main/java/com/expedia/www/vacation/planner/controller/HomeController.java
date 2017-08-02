package com.expedia.www.vacation.planner.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

  @RequestMapping("/")
  public String home() {
      return "redirect:swagger-ui.html";
  }

  @RequestMapping("/home")
  public  String landingPage() {
      return "landingPage";
  }
}
