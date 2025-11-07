import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: 'Co to jest pozycja senioralna w hipotece?',
      answer: 'Pozycja senioralna oznacza, że TS Finanse jest jedynym podmiotem wpisanym w hipotece i ma pierwszeństwo w zaspokojeniu swoich roszczeń. Nie akceptujemy nieruchomości obciążonych innymi hipotekami.'
    },
    {
      question: 'Jak szybko mogę otrzymać decyzję?',
      answer: 'Analizę wstępną przeprowadzamy w ciągu 24 godzin. Pełna decyzja kredytowa może zapaść w 3 dni robocze od otrzymania kompletu dokumentów.'
    },
    {
      question: 'Jakie dokumenty są wymagane?',
      answer: 'Podstawowe dokumenty to: odpis KRS/CEIDG, ostatnie sprawozdanie finansowe, dokumentacja nieruchomości (akt własności, wypis z KW), wycena nieruchomości. Szczegółową listę przesyłamy po wstępnej akceptacji.'
    },
    {
      question: 'Co to jest LTV i dlaczego max 60%?',
      answer: 'LTV (Loan-to-Value) to stosunek wartości pożyczki do wartości nieruchomości. Przy LTV 60% dla nieruchomości wartej 10 mln PLN można otrzymać maksymalnie 6 mln PLN pożyczki. To zabezpiecza obie strony.'
    },
    {
      question: 'Czy mogę spłacić pożyczkę wcześniej?',
      answer: 'Tak, oferujemy możliwość wcześniejszej spłaty. Szczegóły dotyczące ewentualnych prowizji za wcześniejszą spłatę są zawarte w indywidualnej umowie.'
    },
    {
      question: 'Jakie nieruchomości są akceptowane jako zabezpieczenie?',
      answer: 'Akceptujemy: mieszkania, domy, lokale komercyjne, działki inwestycyjne i nieruchomości komercyjne z całej Polski. Kluczowa jest płynność i wycena nieruchomości.'
    },
    {
      question: 'Czy finansujecie startupy?',
      answer: 'Nie. Pożyczki udzielamy wyłącznie firmom prowadzącym działalność gospodarczą, które posiadają nieruchomość do zabezpieczenia. Preferujemy firmy z historią działalności.'
    },
    {
      question: 'Czym różnicie się od banku?',
      answer: 'Mamy własny kapitał, więc nie jesteśmy ograniczeni regulacjami bankowymi. To pozwala na szybsze decyzje, elastyczność i możliwość finansowania projektów odrzucanych przez banki.'
    },
    {
      question: 'Jakie są koszty pożyczki?',
      answer: 'Podstawowe oprocentowanie to 15% rocznie. Wszystkie dodatkowe koszty (wycena nieruchomości, opłaty notarialne) są transparentnie przedstawione w ofercie indywidualnej przed podpisaniem umowy.'
    },
    {
      question: 'Czy współpracujecie z pośrednikami?',
      answer: 'Tak, oferujemy program partnerski dla pośredników kredytowych z prowizją 1% od wartości udzielonej pożyczki. Kontakt dla partnerów: partnerzy@tsfinanse.com'
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gradient-to-br from-white via-[#D4AF7A]/5 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-[#3D1F1F] text-[32px]">
            Najczęściej Zadawane Pytania
          </h2>
          <p className="text-lg text-[#3D1F1F]/70">
            Odpowiedzi na pytania, które mogą Cię nurtować
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-[#3D1F1F]/10 rounded-xl px-6 bg-white hover:border-[#3D1F1F]/30 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="text-[#3D1F1F] pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-[#3D1F1F]/80 pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-[#3D1F1F]/70 mb-4">
            Nie znalazłeś odpowiedzi na swoje pytanie?
          </p>
          <a
            href="mailto:kontakt@tsfinanse.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D1F1F] text-white rounded-lg hover:bg-[#2A1414] transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Skontaktuj się z nami
          </a>
        </div>
      </div>
    </section>
  );
}
