package com.expedia.www.vacation.planner.init;

import com.codahale.metrics.servlet.InstrumentedFilter;
import com.expedia.www.platform.isactive.providers.ManifestBasedVersionProvider;
import com.expedia.www.platform.isactive.providers.ManifestReader;
import com.expedia.www.platform.isactive.servlet.BuildInfoServlet;
import com.expedia.www.platform.isactive.servlet.IsActiveServlet;
import com.expedia.www.platform.isactive.servlet.WebAppManifestPathProvider;
import com.expedia.www.platform.monitoring.MonitoringAgent;
import org.apache.commons.lang.Validate;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.ServletContextAware;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import javax.servlet.FilterChain;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Configuration
@EnableConfigurationProperties
@SuppressWarnings( {"PMD.SingularField", "PMD.ImmutableField"})
public class InitSupport implements ServletContextAware {

  private static final String HOST_NAME =
      ManagementFactory.getRuntimeMXBean().getName().split("@")[1].replace('.', '_');
  private ServletContext servletContext;

  @Bean
  public ManifestBasedVersionProvider manifestBasedVersionProvider() {
    return new ManifestBasedVersionProvider(new WebAppManifestPathProvider(servletContext),
        new ManifestReader());
  }

  /**
   * Setup MonitoringAgentConfig for the service.
   *
   * @param versionProvider ManifestBasedVersionProvider to get version information.
   * @return MonitoringAgentConfig
   */
  @Bean
  @ConfigurationProperties
  public MonitoringAgentConfig monitoringAgentConfig(ManifestBasedVersionProvider versionProvider) {
    final MonitoringAgentConfig agentConfig = new MonitoringAgentConfig();
    agentConfig.setHostName(HOST_NAME, versionProvider.get());
    return agentConfig;
  }

  /**
   * Setup MonitoringAgent for the service.
   *
   * @param monitoringAgentConfig MonitoringAgentConfig to configure MonitoringAgent
   * @return MonitoringAgent
   * @throws Exception If MonitoringAgent cannot be created.
   */
  @Bean(initMethod = "start")
  public MonitoringAgent monitoringAgent(MonitoringAgentConfig monitoringAgentConfig)
      throws Exception {
    return new MonitoringAgent(monitoringAgentConfig.getMonitoringAgent());
  }

  /**
   * Setup buildinfo endpoint for this application.
   *
   * @return ServletRegistrationBean
   */
  @Bean
  public ServletRegistrationBean registBuildInfo() {
    final ServletRegistrationBean buildInfoBean =
        new ServletRegistrationBean(new BuildInfoServlet(), "/buildInfo");
    buildInfoBean.setName("buildInfo");
    return buildInfoBean;
  }

  /**
   * Setup isActive endpoint for this application.
   *
   * @return ServletRegistrationBean
   */
  @Bean
  public ServletRegistrationBean registIsActive() {
    final ServletRegistrationBean isActiveBean =
        new ServletRegistrationBean(new IsActiveServlet(), "/isActive");
    isActiveBean.setName("isActive");
    return isActiveBean;
  }

  /**
   * Create the The CORS FilterRegistrationBean for this service.
   *
   * @return FilterRegistrationBean
   */
  @Bean
  public FilterRegistrationBean corsFilterRegistrationBean() {
    final FilterRegistrationBean registrationBean = new FilterRegistrationBean();

    registrationBean.setFilter(new OncePerRequestFilter() {
      @Override
      protected void doFilterInternal(HttpServletRequest httpServletRequest,
                                      HttpServletResponse httpServletResponse,
                                      FilterChain filterChain)
          throws ServletException, IOException {

        // For the security reason, CORS should be turned off here. Please change the setting based
        // on your application environment to enable CORS when you fully understand the potential
        // security threat.
        final String requestOrigin = httpServletRequest.getHeader("Origin");
        if ("https://YOUR_SITE.expedia.com:443".equalsIgnoreCase(requestOrigin)) {
          httpServletResponse.addHeader("Access-Control-Allow-Origin", requestOrigin);
          httpServletResponse.addHeader("Access-Control-Allow-Methods",
              "GET, POST, PUT, DELETE, OPTIONS");
          httpServletResponse.addHeader("Access-Control-Allow-Headers",
              "origin, content-type, accept, x-requested-with");
        }

        filterChain.doFilter(httpServletRequest, httpServletResponse);
      }
    });

    return registrationBean;
  }

  /**
   * Create the The Metrics Web FilterRegistrationBean for this service.
   *
   * @return FilterRegistrationBean
   */
  @Bean
  public FilterRegistrationBean metricsWebFilterRegistrationBean() {
    final FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    registrationBean.setFilter(new InstrumentedFilter());
    return registrationBean;
  }

  @Override
  public void setServletContext(ServletContext servletContext) {
    Validate.notNull(servletContext, "servletContext is required");
    this.servletContext = servletContext;
  }
}
