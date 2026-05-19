import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const floatRing = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-12px) rotate(3deg); }
`;

export const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

/* ─── Hero Panel ─── */

export const HeroPanel = styled.div`
  flex: 0 0 56%;
  background: linear-gradient(150deg, #0a0d14 0%, #101520 60%, #15203a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 72px;
  position: relative;
  overflow: hidden;

  @media (max-width: 800px) {
    display: none;
  }
`;

export const DecorRing = styled.div`
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(245, 158, 11, 0.08);
  pointer-events: none;

  &:nth-child(1) {
    width: 520px;
    height: 520px;
    top: -140px;
    right: -140px;
    animation: ${floatRing} 9s ease-in-out infinite;
  }

  &:nth-child(2) {
    width: 320px;
    height: 320px;
    bottom: -80px;
    left: -60px;
    border-color: rgba(245, 158, 11, 0.05);
    animation: ${floatRing} 12s ease-in-out infinite reverse;
  }
`;

export const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

export const HeroTitle = styled.h1`
  font-family: "Bebas Neue", sans-serif;
  font-size: clamp(78px, 8.5vw, 128px);
  line-height: 0.88;
  color: #ffffff;
  margin: 32px 0 28px;
  letter-spacing: 4px;
`;

export const HeroAccentBar = styled.div`
  width: 48px;
  height: 4px;
  background: #f59e0b;
  border-radius: 2px;
  margin-bottom: 20px;
`;

export const HeroSubtitle = styled.p`
  font-family: "Outfit", sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.38);
  line-height: 1.75;
  max-width: 280px;
`;

export const HeroFooter = styled.div`
  position: absolute;
  bottom: 36px;
  left: 72px;
  font-family: "Outfit", sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.18);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

/* ─── Form Panel ─── */

export const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary, #f8fafc);
  padding: 48px 32px;
`;

export const FormCard = styled.div`
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeUp} 0.5s ease both;
`;

export const AppBrand = styled.div`
  font-family: "Outfit", sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--accent, #6366f1);
  letter-spacing: -0.2px;
  margin-bottom: 4px;
`;

export const FormHeading = styled.h2`
  font-family: "Outfit", sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  margin: 0;
  letter-spacing: -0.6px;
  line-height: 1.2;
`;

export const FormSub = styled.p`
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  color: var(--text-muted, #64748b);
  margin: 0 0 6px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ErrorMsg = styled.span`
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  color: #ef4444;
`;

export const SuccessMsg = styled.span`
  font-family: "Outfit", sans-serif;
  font-size: 13px;
  color: #10b981;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 10px 12px;
  border-radius: 6px;
  display: block;
  text-align: center;
`;

export const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`;

export const ForgotLink = styled.div`
  font-family: "Outfit", sans-serif;
  font-size: 13px;

  a {
    color: var(--text-muted, #64748b);
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--accent, #6366f1);
    }
  }
`;

export const LangRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
`;

export const SignupLink = styled.div`
  font-family: "Outfit", sans-serif;
  font-size: 14px;
  color: var(--text-muted, #64748b);

  a {
    color: var(--accent, #6366f1);
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }
`;
