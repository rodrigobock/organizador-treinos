package org.organizadorTreinos.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.InternalServerErrorException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;
import org.organizadorTreinos.entity.User;

@ApplicationScoped
public class EmailService {

    private static final Logger LOG = Logger.getLogger(EmailService.class);

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
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(user.getEmail())
                    .subject("Bem-vindo ao Organizador de Treinos!")
                    .html(buildWelcomeHtml(user.getName()))
                    .build();
            resend.emails().send(params);
        } catch (Exception e) {
            LOG.warnf("Failed to send welcome email to %s: %s", user.getEmail(), e.getMessage());
        }
    }

    public void sendPasswordReset(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject("Redefinição de Senha")
                    .html(buildPasswordResetHtml(resetLink))
                    .build();
            resend.emails().send(params);
        } catch (Exception e) {
            LOG.warnf("Failed to send password reset email to %s: %s", email, e.getMessage());
        }
    }

    private String buildWelcomeHtml(String name) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Bem-vindo, %s!</h2>
                  <p>Sua conta no <strong>Organizador de Treinos</strong> foi criada com sucesso.</p>
                  <p>Agora você pode organizar seus treinos e exercícios em um só lugar.</p>
                  <p>Bons treinos!</p>
                </div>
                """.formatted(name);
    }

    private String buildPasswordResetHtml(String resetLink) {
        return """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Redefinição de senha</h2>
                  <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                  <p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
                  <p>
                    <a href="%s" style="background-color: #007bff; color: white; padding: 12px 24px;
                       text-decoration: none; border-radius: 4px; display: inline-block;">
                      Redefinir senha
                    </a>
                  </p>
                  <p>Se você não solicitou a redefinição, ignore este email.</p>
                </div>
                """.formatted(resetLink);
    }
}
