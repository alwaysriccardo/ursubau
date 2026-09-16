import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { useLanguage } from '../LanguageContext';

interface LegalPageProps {
  page: 'agb' | 'datenschutz';
}

type Section = { title: string; body: React.ReactNode };

const companyBlock = (
  <p>
    {CONTACT_INFO.companyName}<br />
    {CONTACT_INFO.addressLine1}<br />
    5012 Schönenwerd, Kanton Solothurn, Schweiz<br />
    Telefon: {CONTACT_INFO.phone}<br />
    E-Mail: <a className="underline" href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
  </p>
);

const AGB_SECTIONS: Section[] = [
  { title: '1. Geltungsbereich', body: <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Verträge zwischen der {CONTACT_INFO.companyName} (nachfolgend «Unternehmer») und ihren Kundinnen und Kunden (nachfolgend «Auftraggeber») über Bau-, Renovierungs-, Maler-, Boden-, Fassaden- und Reinigungsarbeiten. Abweichende Bedingungen des Auftraggebers gelten nur, wenn sie vom Unternehmer schriftlich bestätigt wurden.</p> },
  { title: '2. Offerten und Vertragsabschluss', body: <p>Offerten sind kostenlos und unverbindlich. Sofern nicht anders angegeben, sind sie 30 Tage gültig. Ein Vertrag kommt mit der schriftlichen Auftragsbestätigung (auch per E-Mail oder WhatsApp) oder mit dem Beginn der Arbeiten zustande. Mündliche Nebenabreden bedürfen der schriftlichen Bestätigung.</p> },
  { title: '3. Preise', body: <p>Alle Preise verstehen sich in Schweizer Franken (CHF). Ob die Mehrwertsteuer enthalten ist, ist in der Offerte ausgewiesen. Zusätzliche Arbeiten, die nicht in der Offerte enthalten sind oder durch unvorhersehbare Umstände (z. B. verdeckte Schäden) notwendig werden, werden nach Rücksprache mit dem Auftraggeber nach Aufwand verrechnet.</p> },
  { title: '4. Ausführung und Termine', body: <p>Der Unternehmer führt die Arbeiten fachgerecht und nach den anerkannten Regeln der Technik aus. Vereinbarte Termine werden nach Möglichkeit eingehalten. Verzögerungen aufgrund von Witterung, Lieferengpässen, höherer Gewalt oder fehlender Mitwirkung des Auftraggebers berechtigen nicht zu Schadenersatz oder Rücktritt.</p> },
  { title: '5. Pflichten des Auftraggebers', body: <p>Der Auftraggeber stellt sicher, dass die Arbeitsräume zum vereinbarten Zeitpunkt zugänglich sind und Strom sowie Wasser zur Verfügung stehen. Er informiert den Unternehmer vorgängig über bekannte Besonderheiten wie Leitungen, Schadstoffe (z. B. Asbest) oder statische Einschränkungen. Allfällige Bewilligungen sind, sofern nicht anders vereinbart, Sache des Auftraggebers.</p> },
  { title: '6. Abnahme', body: <p>Nach Abschluss der Arbeiten erfolgt eine gemeinsame Abnahme. Sichtbare Mängel sind sofort, versteckte Mängel unverzüglich nach ihrer Entdeckung schriftlich zu melden. Werden die Arbeiten ohne Beanstandung in Gebrauch genommen, gelten sie als abgenommen.</p> },
  { title: '7. Zahlungsbedingungen', body: <p>Rechnungen sind innert 30 Tagen ab Rechnungsdatum ohne Abzug zahlbar. Bei grösseren Aufträgen kann der Unternehmer Anzahlungen oder Teilrechnungen nach Baufortschritt verlangen. Nach Ablauf der Zahlungsfrist gerät der Auftraggeber ohne Mahnung in Verzug; es ist ein Verzugszins von 5 % geschuldet. Das Recht auf Eintragung eines Bauhandwerkerpfandrechts bleibt vorbehalten.</p> },
  { title: '8. Gewährleistung', body: <p>Der Unternehmer leistet Gewähr für eine fachgerechte Ausführung gemäss den Bestimmungen des Schweizerischen Obligationenrechts (Werkvertrag, Art. 363 ff. OR). Bei berechtigten Mängelrügen hat der Unternehmer zunächst das Recht zur Nachbesserung. Keine Gewähr besteht für Schäden durch unsachgemässe Nutzung, normale Abnützung oder Eingriffe Dritter.</p> },
  { title: '9. Haftung', body: <p>Der Unternehmer haftet für Schäden, die er vorsätzlich oder grobfahrlässig verursacht. Die Haftung für leichte Fahrlässigkeit sowie für indirekte Schäden und Folgeschäden ist, soweit gesetzlich zulässig, ausgeschlossen. Der Unternehmer verfügt über eine Betriebshaftpflichtversicherung.</p> },
  { title: '10. Annullierung', body: <p>Storniert der Auftraggeber einen bestätigten Auftrag, kann der Unternehmer bereits erbrachte Leistungen, bestelltes Material sowie eine angemessene Entschädigung für den entgangenen Gewinn in Rechnung stellen (Art. 377 OR).</p> },
  { title: '11. Datenschutz', body: <p>Personendaten werden gemäss unserer <a className="underline" href="/datenschutz">Datenschutzerklärung</a> bearbeitet.</p> },
  { title: '12. Anwendbares Recht und Gerichtsstand', body: <p>Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist der Sitz der {CONTACT_INFO.companyName} in Schönenwerd (SO), soweit gesetzlich zulässig. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Gültigkeit der übrigen Bestimmungen unberührt.</p> },
];

const PRIVACY_SECTIONS: Section[] = [
  { title: '1. Verantwortliche Stelle', body: <>
      <p>Verantwortlich für die Bearbeitung von Personendaten auf dieser Website ist:</p>
      {companyBlock}
      <p>Diese Datenschutzerklärung richtet sich nach dem Schweizer Bundesgesetz über den Datenschutz (DSG) und, soweit anwendbar, nach der EU-Datenschutz-Grundverordnung (DSGVO).</p>
    </> },
  { title: '2. Welche Daten wir bearbeiten', body: <p>Wir bearbeiten Personendaten, die Sie uns selbst mitteilen – etwa Name, E-Mail-Adresse, Telefonnummer, Adresse und den Inhalt Ihrer Anfrage, wenn Sie uns per Kontaktformular, E-Mail, Telefon oder WhatsApp kontaktieren. Zudem werden beim Besuch der Website technisch notwendige Daten (z. B. IP-Adresse, Datum und Uhrzeit, Browsertyp, aufgerufene Seiten) in Server-Logfiles erfasst.</p> },
  { title: '3. Zweck der Bearbeitung', body: <p>Wir verwenden Ihre Daten ausschliesslich, um Ihre Anfrage zu beantworten, Offerten zu erstellen, Aufträge auszuführen und abzurechnen sowie um den sicheren und stabilen Betrieb dieser Website zu gewährleisten. Eine Weitergabe zu Werbezwecken oder ein Verkauf Ihrer Daten findet nicht statt.</p> },
  { title: '4. Kontaktformular und E-Mail', body: <p>Das Kontaktformular öffnet Ihr eigenes E-Mail-Programm mit einer vorausgefüllten Nachricht an uns. Die Daten werden erst übermittelt, wenn Sie die E-Mail absenden. Unser E-Mail-Postfach wird bei Google (Gmail) betrieben; Daten können dabei auch in den USA bearbeitet werden.</p> },
  { title: '5. Hosting', body: <p>Diese Website wird bei Vercel Inc. (USA) gehostet. Bilder des Portfolios werden bei einem Cloud-Speicheranbieter abgelegt. Beim Aufruf der Website werden technische Daten wie Ihre IP-Adresse an diese Anbieter übermittelt. Die Übermittlung in die USA erfolgt auf Grundlage geeigneter Garantien (z. B. Standardvertragsklauseln bzw. Swiss-U.S. Data Privacy Framework).</p> },
  { title: '6. Eingebundene Dienste Dritter', body: <>
      <p><strong>Google Maps:</strong> Zur Darstellung unseres Standorts binden wir Karten von Google Ireland Ltd. / Google LLC ein. Dabei wird Ihre IP-Adresse an Google übermittelt.</p>
      <p><strong>Google Fonts und Content Delivery Networks:</strong> Schriftarten und technische Bibliotheken werden von externen Servern (u. a. Google, Tailwind CSS CDN) geladen. Dabei wird Ihre IP-Adresse an diese Anbieter übermittelt.</p>
      <p><strong>Bilder von Unsplash:</strong> Einzelne Hintergrundbilder werden von den Servern von Unsplash geladen.</p>
      <p><strong>TikTok, Facebook und WhatsApp:</strong> Auf unserer Website befinden sich lediglich Links zu TikTok, Facebook und WhatsApp. Erst wenn Sie einen solchen Link anklicken, werden Daten an den jeweiligen Anbieter (TikTok / Meta) übermittelt. Es gelten deren Datenschutzbestimmungen.</p>
    </> },
  { title: '7. Cookies', body: <p>Diese Website verwendet keine Tracking- oder Marketing-Cookies und keine Analyse-Tools.</p> },
  { title: '8. Aufbewahrungsdauer', body: <p>Wir bewahren Personendaten nur so lange auf, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten (z. B. 10 Jahre für Geschäftsunterlagen) bestehen.</p> },
  { title: '9. Ihre Rechte', body: <p>Sie haben das Recht auf Auskunft über Ihre bei uns gespeicherten Personendaten sowie auf Berichtigung, Löschung oder Einschränkung der Bearbeitung und auf Herausgabe Ihrer Daten. Sie können eine erteilte Einwilligung jederzeit widerrufen. Wenden Sie sich dazu an die oben genannte Adresse. Sie haben zudem das Recht, sich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) zu beschweren.</p> },
  { title: '10. Änderungen', body: <p>Wir können diese Datenschutzerklärung jederzeit anpassen. Es gilt die jeweils auf dieser Website veröffentlichte Fassung.</p> },
];

const LegalPage: React.FC<LegalPageProps> = ({ page }) => {
  const { t } = useLanguage();
  const isAgb = page === 'agb';
  const title = isAgb ? 'Allgemeine Geschäftsbedingungen (AGB)' : 'Datenschutzerklärung';
  const sections = isAgb ? AGB_SECTIONS : PRIVACY_SECTIONS;

  return (
    <div className="min-h-screen bg-swiss-cream text-swiss-dark px-6 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B7355] hover:text-swiss-dark transition-colors mb-12">
          <ArrowLeft size={14} /> {t('legal_back')}
        </a>
        <img src="/ursubaulogo.jpg" alt={CONTACT_INFO.companyName} className="w-28 h-28 object-contain mb-8 rounded-lg bg-white" />
        <h1 className="font-display text-2xl md:text-4xl leading-tight mb-4">{title}</h1>
        <p className="text-sm text-swiss-stone mb-12">{CONTACT_INFO.companyName} · Stand: {new Date().getFullYear()}</p>

        <div className="space-y-10 font-body text-base leading-relaxed text-[#3d3d3d]">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="font-serif italic text-xl md:text-2xl text-swiss-dark">{section.title}</h2>
              {section.body}
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-swiss-dark/10 flex gap-6 text-xs uppercase tracking-widest text-[#8B7355]">
          <a href="/agb" className="hover:text-swiss-dark">AGB</a>
          <a href="/datenschutz" className="hover:text-swiss-dark">Datenschutz</a>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
