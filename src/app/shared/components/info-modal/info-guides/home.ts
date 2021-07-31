import {Capacitor} from '@capacitor/core';

export const loginPageGuide = `
<p>
Hey, wat mooi dat je onze app gaat gebruiken! Op deze pagina staat alle informatie die jij nodig hebt om in te kunnen loggen bij Streepn.
</p>

<h4>Registreren</h4>
<p>
Als je nog geen account hebt dan kun je op twee manieren registreren. Ten eerste kun je klikken op de 'Registreer je nu' knop. 
Ten tweede kun je op een iOS device inloggen met je Apple account, daarvoor is geen registratie nodig.
</p>

<h4>Inloggen met je e-mailadres</h4>
<p>
Vul je e-mailadres en wachtwoord in en klik op 'Inloggen'. Dat zou voldoende moeten zijn 😉
</p>
` + Capacitor.getPlatform() === 'ios' ? `
<h4>Inloggen met Apple</h4>
<p>
Omdat jij een Apple device gebruikt kun je ook inloggen met je Apple ID. Klik op de 'Inloggen met Apple' knop en gaan met de banaan!
</p>
` : '';
