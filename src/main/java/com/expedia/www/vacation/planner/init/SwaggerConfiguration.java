package com.expedia.www.vacation.planner.init;

import static com.google.common.base.Predicates.or;
import static springfox.documentation.builders.PathSelectors.regex;
import static springfox.documentation.schema.AlternateTypeRules.newRule;

import org.joda.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.async.DeferredResult;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.schema.WildcardType;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.Tag;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger.web.UiConfiguration;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Predicate;

@EnableSwagger2
@Configuration
@SuppressWarnings("unused")
public class SwaggerConfiguration {

  @Value("${swagger.service.version}")
  private String serviceVersion;

  @Value("${swagger.service.title}")
  private String serviceTitle;

  @Value("${swagger.service.description}")
  private String serviceDescription;

  @Value("${swagger.service.termsPath}")
  private String serviceTermsPath;

  @Value("${swagger.service.email}")
  private String serviceEmail;

  @Value("${swagger.service.licenceType}")
  private String serviceLicenceType;

  @Value("${swagger.service.licencePath}")
  private String serviceLicencePath;

  private TypeResolver typeResolver;

  @Value("${swagger.service.contact.name}")
  private String contactName;

  @Value("${swagger.service.contact.url}")
  private String contactUrl;

  @Value("${swagger.service.contact.email}")
  private String contactEmail;

  /**
   * @return Returns a Swagger 2.0 Specification for the current application
   */
  @Bean
  @SuppressWarnings("javadoc")
  public Docket swaggerSpringMvcPlugin() {
    return new Docket(DocumentationType.SWAGGER_2)
            .select()
            .apis(RequestHandlerSelectors.any())
            .paths(paths())
            .build()
            .apiInfo(apiInfo())
            .pathMapping("/")
            .directModelSubstitute(LocalDate.class,
                    String.class)
            .genericModelSubstitutes(ResponseEntity.class)
            .alternateTypeRules(
                    newRule(typeResolver.resolve(DeferredResult.class,
                            typeResolver.resolve(ResponseEntity.class, WildcardType.class)),
                            typeResolver.resolve(WildcardType.class))
            )
            .tags(new Tag("demo", "Demo endpoints for Primer"))
            // .tags(new Tag("default", "Basic endpoints for your app"))
            .useDefaultResponseMessages(false);
  }

  private Predicate<String> paths() {
    return or(
            // regex("/your_endpoint/.*?"),
            regex("/service/.*?")
    );
  }

  private ApiInfo apiInfo() {

    return new ApiInfo(serviceTitle,
        serviceDescription,
        serviceVersion,
        serviceTermsPath,
        new Contact(
                contactName,
                contactUrl,
                contactEmail
        ),
        serviceLicenceType,
        serviceLicencePath);
  }

  @Bean
  UiConfiguration uiConfig() {
    // To turn off Swagger UI validation
    return new UiConfiguration(null);
  }

  @Autowired
  public void setTypeResolver(TypeResolver typeResolver) {
    this.typeResolver = typeResolver;
  }
}
