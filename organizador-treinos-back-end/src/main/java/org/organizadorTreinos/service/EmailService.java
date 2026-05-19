package org.organizadorTreinos.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.organizadorTreinos.entity.User;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);
    private static final String APP_NAME = "Organizador de Treinos";

    @ConfigProperty(name = "resend.api-key")
    String apiKey;

    @ConfigProperty(name = "resend.from-email", defaultValue = "Organizador de Treinos <noreply@seudominio.com>")
    String fromEmail;

    @ConfigProperty(name = "app.frontend-url", defaultValue = "http://localhost:3000")
    String frontendUrl;

    private Resend resend;

    @PostConstruct
    void init() {
        resend = new Resend(apiKey);
    }

    public void sendWelcome(User user) {
        try {
            String locale = resolveLocale(user.getPreferredLocale());
            String subject = "en".equals(locale)
                    ? "Welcome to Organizador de Treinos!"
                    : "Bem-vindo ao Organizador de Treinos!";

            String html = loadTemplate("welcome", locale);
            html = html.replace("{{name}}", user.getName())
                       .replace("{{appName}}", APP_NAME)
                       .replace("{{appUrl}}", frontendUrl);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(user.getEmail())
                    .subject(subject)
                    .html(html)
                    .build();
            resend.emails().send(params);
        } catch (Exception e) {
            LOG.warnf("Failed to send welcome email to %s: %s", user.getEmail(), e.getMessage());
        }
    }

    public void sendPasswordReset(User user, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            String locale = resolveLocale(user.getPreferredLocale());
            String subject = "en".equals(locale)
                    ? "Password Reset"
                    : "Redefinicao de Senha";

            String html = loadTemplate("password-reset", locale);
            html = html.replace("{{name}}", user.getName())
                       .replace("{{resetLink}}", resetLink)
                       .replace("{{appName}}", APP_NAME);

            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(user.getEmail())
                    .subject(subject)
                    .html(html)
                    .build();
            resend.emails().send(params);
        } catch (Exception e) {
            LOG.warnf("Failed to send password reset email to %s: %s", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Loads an HTML email template from the classpath.
     * Falls back to pt-BR if the requested locale template is not found.
     * Falls back to inline HTML if no template file exists at all.
     */
    String loadTemplate(String templateName, String locale) {
        String path = "email-templates/" + templateName + "_" + locale + ".html";
        String content = readResource(path);
        if (content != null) {
            return content;
        }

        // Fallback to pt-BR
        if (!"pt-BR".equals(locale)) {
            String fallbackPath = "email-templates/" + templateName + "_pt-BR.html";
            content = readResource(fallbackPath);
            if (content != null) {
                LOG.warnf("Template not found for locale '%s', falling back to pt-BR: %s", locale, path);
                return content;
            }
        }

        // Final fallback: inline default
        LOG.warnf("No template file found for '%s', using inline fallback", path);
        return buildInlineFallback(templateName);
    }

    private String readResource(String path) {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
            if (is == null) {
                return null;
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            LOG.warnf("Error reading template %s: %s", path, e.getMessage());
            return null;
        }
    }

    private String buildInlineFallback(String templateName) {
        if ("welcome".equals(templateName)) {
            return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Bem-vindo, {{name}}!</h2>
                  <p>Sua conta no <strong>{{appName}}</strong> foi criada com sucesso.</p>
                  <p>Agora voce pode organizar seus treinos e exercicios em um so lugar.</p>
                  <p>Bons treinos!</p>
                </div>
                """;
        }
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Redefinicao de senha</h2>
              <p>Recebemos uma solicitacao para redefinir a senha da sua conta.</p>
              <p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
              <p>
                <a href="{{resetLink}}" style="background-color: #007bff; color: white; padding: 12px 24px;
                   text-decoration: none; border-radius: 4px; display: inline-block;">
                  Redefinir senha
                </a>
              </p>
              <p>Se voce nao solicitou a redefinicao, ignore este email.</p>
            </div>
            """;
    }

    private String resolveLocale(String preferredLocale) {
        if (preferredLocale != null && preferredLocale.startsWith("en")) {
            return "en";
        }
        return "pt-BR";
    }
}
