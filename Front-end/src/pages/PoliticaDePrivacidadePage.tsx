// Em um arquivo como PoliticaDePrivacidadePage.tsx
import React from 'react';

const PoliticaDePrivacidadePage = () => {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-black/50 p-8 rounded-lg shadow-xl border border-aegis-purple/30">
        <h1 className="text-4xl font-bold text-aegis-purple mb-8 text-center">Política de Privacidade Aegis Security</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">1. Nosso Compromisso com a Privacidade</h2>
          <p className="text-white/80 leading-relaxed">
            A Aegis Security ("nós", "nosso" ou "Aegis Security") está comprometida em proteger a privacidade de seus usuários ("você", "seu"). Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nossos Serviços, incluindo o uso opcional de tecnologia de reconhecimento facial. Solicitamos que você leia esta política de privacidade com atenção. Se você não concordar com os termos desta política de privacidade, por favor, não acesse os serviços.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">2. Informações que Coletamos</h2>
          <p className="text-white/80 leading-relaxed mb-2">
            Podemos coletar informações sobre você de várias maneiras. As informações que podemos coletar através dos Serviços incluem:
          </p>
          <h3 className="text-xl font-medium text-aegis-purple/70 mt-4 mb-2">A. Dados Pessoais</h3>
          <p className="text-white/80 leading-relaxed">
            Informações pessoalmente identificáveis, como seu nome, sobrenome, endereço de e-mail, país e senha, que você nos fornece voluntariamente quando se registra nos Serviços.
          </p>

          <h3 className="text-xl font-medium text-aegis-purple/70 mt-4 mb-2">B. Dados de Reconhecimento Facial (Biométricos)</h3>
          <p className="text-white/80 leading-relaxed mb-2">
            Se você optar por usar nosso recurso de cadastro ou login por reconhecimento facial, coletaremos imagens e dados derivados de seu rosto ("Dados Faciais"). Esses dados são usados exclusivamente para fins de verificação de identidade e autenticação. Especificamente:
          </p>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-1 pl-4">
            <li><strong>Coleta:</strong> A imagem do seu rosto é capturada através da câmera do seu dispositivo durante o processo de cadastro facial ou login facial.</li>
            <li><strong>Processamento:</strong> Convertemos a imagem do seu rosto em um modelo biométrico (um conjunto de números ou um template) para comparação.</li>
            <li><strong>Armazenamento:</strong> [Descreva aqui como e onde os dados faciais são armazenados. Ex: "O modelo biométrico é armazenado de forma segura e criptografada em nossos servidores." ou "A imagem original é descartada após a criação do modelo." - SEJA MUITO ESPECÍFICO E PRECISO AQUI. CONSULTE SEU DESENVOLVIMENTO E REQUISITOS LEGAIS.]</li>
            <li><strong>Uso:</strong> Utilizamos os Dados Faciais apenas para verificar sua identidade quando você opta por usar o login facial. Não usamos seus Dados Faciais para nenhuma outra finalidade.</li>
          </ul>
           <p className="text-white/80 leading-relaxed mt-2">
            O fornecimento de seus Dados Faciais é totalmente voluntário. Você pode usar nossos Serviços sem habilitar o reconhecimento facial.
          </p>

          <h3 className="text-xl font-medium text-aegis-purple/70 mt-4 mb-2">C. Dados de Uso e Cookies</h3>
          <p className="text-white/80 leading-relaxed">
            Podemos coletar informações que seu navegador envia sempre que você visita nosso Serviço ou quando você acessa o Serviço por ou através de um dispositivo móvel ("Dados de Uso"). Estes Dados de Uso podem incluir informações como o endereço de Protocolo de Internet do seu computador (por exemplo, endereço IP), tipo de navegador, versão do navegador, as páginas do nosso Serviço que você visita, a hora e data da sua visita, o tempo gasto nessas páginas, identificadores únicos de dispositivos e outros dados de diagnóstico.
            [Se usar cookies, detalhe aqui].
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">3. Como Usamos Suas Informações</h2>
          <p className="text-white/80 leading-relaxed mb-2">
            Tendo informações precisas sobre você, podemos fornecer uma experiência segura, eficiente e personalizada. Especificamente, podemos usar as informações coletadas sobre você através dos Serviços para:
          </p>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-1 pl-4">
            <li>Criar e gerenciar sua conta.</li>
            <li>Autenticar sua identidade, inclusive por meio de reconhecimento facial, se habilitado por você.</li>
            <li>Enviar e-mails administrativos, como confirmações de conta, atualizações de segurança ou alterações em nossas políticas.</li>
            <li>Melhorar a eficiência e a operação dos Serviços.</li>
            <li>Monitorar e analisar o uso e as tendências para melhorar sua experiência com os Serviços.</li>
            <li>Prevenir atividades fraudulentas, monitorar contra roubo e proteger contra atividades criminosas.</li>
            <li>Responder às suas solicitações de atendimento ao cliente.</li>
            <li>Cumprir obrigações legais.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">4. Compartilhamento de Suas Informações</h2>
          <p className="text-white/80 leading-relaxed mb-2">
            Não compartilharemos suas informações pessoais, incluindo seus Dados Faciais, com terceiros, exceto conforme descrito nesta Política de Privacidade ou com o seu consentimento explícito. Podemos compartilhar informações sobre você nas seguintes situações:
          </p>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-1 pl-4">
            <li><strong>Por Lei ou para Proteger Direitos:</strong> Se acreditarmos que a divulgação é necessária para responder a processos legais, investigar ou remediar potenciais violações de nossas políticas, ou proteger os direitos, propriedade e segurança de outros, podemos compartilhar suas informações conforme permitido ou exigido por qualquer lei, regra ou regulamento aplicável.</li>
            <li><strong>Prestadores de Serviços Terceirizados:</strong> Podemos compartilhar suas informações com fornecedores terceirizados, prestadores de serviços, contratados ou agentes que realizam serviços para nós ou em nosso nome e exigem acesso a tais informações para fazer esse trabalho (por exemplo, processamento de pagamentos, hospedagem de dados, análise de dados, entrega de e-mail, atendimento ao cliente). [Seja específico se algum prestador de serviço terá acesso a dados faciais e sob quais condições].</li>
            <li><strong>Transferências de Negócios:</strong> Podemos compartilhar ou transferir suas informações em conexão com, ou durante negociações de, qualquer fusão, venda de ativos da empresa, financiamento ou aquisição de toda ou uma parte de nossos negócios para outra empresa.</li>
          </ul>
          <p className="text-white/80 leading-relaxed mt-2">
            <strong>Importante sobre Dados Faciais:</strong> Nós NÃO vendemos, alugamos, comercializamos ou de outra forma divulgamos seus Dados Faciais a terceiros para fins de marketing ou publicidade.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">5. Segurança de Suas Informações</h2>
          <p className="text-white/80 leading-relaxed">
            Usamos medidas de segurança administrativas, técnicas e físicas para ajudar a proteger suas informações pessoais, incluindo seus Dados Faciais. Embora tenhamos tomado medidas razoáveis para proteger as informações pessoais que você nos fornece, esteja ciente de que, apesar de nossos esforços, nenhuma medida de segurança é perfeita ou impenetrável, e nenhum método de transmissão de dados pode ser garantido contra qualquer interceptação ou outro tipo de uso indevido.
            [Detalhe aqui as medidas de segurança específicas para dados faciais, como criptografia, controles de acesso, etc.]
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">6. Retenção de Dados</h2>
          <p className="text-white/80 leading-relaxed">
            Reteremos suas informações pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de Privacidade. Reteremos e usaremos suas informações na medida necessária para cumprir nossas obrigações legais, resolver disputas e fazer cumprir nossas políticas.
          </p>
          <p className="text-white/80 leading-relaxed mt-2">
            <strong>Retenção de Dados Faciais:</strong> [Especifique por quanto tempo os Dados Faciais (ou seus modelos derivados) são retidos. Ex: "Seus Dados Faciais serão retidos enquanto sua conta estiver ativa e você optar por usar o recurso de reconhecimento facial, ou até que você solicite a exclusão. Se sua conta for encerrada, seus Dados Faciais serão excluídos dentro de [X] dias." - CONSULTE REQUISITOS LEGAIS E PRÁTICAS DE NEGÓCIO].
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">7. Seus Direitos de Privacidade</h2>
          <p className="text-white/80 leading-relaxed mb-2">
            Dependendo da sua localização, você pode ter certos direitos em relação às suas informações pessoais, como:
          </p>
          <ul className="list-disc list-inside text-white/80 leading-relaxed space-y-1 pl-4">
            <li>O direito de acessar – Você tem o direito de solicitar cópias de seus dados pessoais.</li>
            <li>O direito de retificação – Você tem o direito de solicitar que corrijamos qualquer informação que você acredita estar imprecisa. Você também tem o direito de solicitar que completemos informações que você acredita estarem incompletas.</li>
            <li>O direito de apagar – Você tem o direito de solicitar que apaguemos seus dados pessoais, sob certas condições. Isso inclui seus Dados Faciais.</li>
            <li>O direito de restringir o processamento – Você tem o direito de solicitar que restrinjamos o processamento de seus dados pessoais, sob certas condições.</li>
            <li>O direito de se opor ao processamento – Você tem o direito de se opor ao nosso processamento de seus dados pessoais, sob certas condições.</li>
            <li>O direito à portabilidade de dados – Você tem o direito de solicitar que transfiramos os dados que coletamos para outra organização, ou diretamente para você, sob certas condições.</li>
          </ul>
          <p className="text-white/80 leading-relaxed mt-2">
            Para exercer esses direitos, entre em contato conosco usando as informações de contato fornecidas abaixo.
          </p>
           <p className="text-white/80 leading-relaxed mt-2">
            Você pode desabilitar o uso do reconhecimento facial e solicitar a exclusão de seus Dados Faciais a qualquer momento através das configurações da sua conta ou entrando em contato conosco.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">8. Privacidade de Crianças</h2>
          <p className="text-white/80 leading-relaxed">
            Nossos Serviços não se destinam a crianças menores de [Defina a idade, por exemplo, 13 ou 18 anos, dependendo da legislação e do seu público]. Não coletamos intencionalmente informações pessoalmente identificáveis de crianças menores dessa idade. Se você é pai ou responsável e sabe que seu filho nos forneceu informações pessoais, entre em contato conosco.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">9. Alterações a Esta Política de Privacidade</h2>
          <p className="text-white/80 leading-relaxed">
            Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data da "Última atualização". Aconselhamos você a revisar esta Política de Privacidade periodicamente para quaisquer alterações.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-aegis-purple/80 mb-3">10. Contato</h2>
          <p className="text-white/80 leading-relaxed">
            Se você tiver alguma dúvida sobre esta Política de Privacidade ou nossas práticas de tratamento de dados, entre em contato conosco em: [Seu Endereço de Email para Contato/DPO].
          </p>
        </section>

        <p className="text-sm text-white/60 mt-10 text-center">
          Última atualização: 31 de maio de 2025
        </p>
      </div>
    </div>
  );
};

export default PoliticaDePrivacidadePage;