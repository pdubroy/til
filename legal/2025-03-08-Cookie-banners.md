# Cookie banners

I was interested in better understanding the EU "cookie law" (officially, the _ePrivacy Directive_). Here's what I found.

From [Cookies, the GDPR, and the ePrivacy Directive](https://gdpr.eu/cookies/)

> To comply with the regulations governing cookies under the GDPR and the ePrivacy Directive you must:
>
> - Receive users’ consent before you use any cookies except strictly necessary cookies.
> - Provide accurate and specific information about the data each cookie tracks and its purpose in plain language before consent is received.
> - Document and store consent received from users.
> - Allow users to access your service even if they refuse to allow the use of certain cookies
> - Make it as easy for users to withdraw their consent as it was for them to give their consent in the first place

A couple interesting aspects:

1. You don't need a cookie banner, you need _informed consent_.
2. You don't need any consent if the cookies are essential! So, what is considered _essential_?

From [Opinion 04/2012 on Cookie Consent Exemption](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf):

> A cookie matching CRITERION B would need to pass the following tests:
>
> 1. A cookie is necessary to provide a specific functionality to the user (or subscriber): if cookies are disabled, the functionality will not be available.
> 2. This functionality has been explicitly requested <u>by the user</u> (or subscriber).

Session cookies used for authentication do not require consent:

> When a user logs in, he explicitly requests access to the content or functionality to which he is authorized. Without the use of an authentication token stored in a cookie the user would have
to provide a username/password on each page request. Therefore this authentication functionality is an essential part of the information society service he is explicitly requesting. As such these cookies are exempted under CRITERION B.

Here's what it says about persistent login cookies:

> Persistent login cookies which store an authentication token across browser sessions are not exempted under CRITERION B.

But:

> The commonly seen method of using a checkbox and a simple information note such as “remember me (uses cookies)” next to the submit form would be an appropriate means of gaining consent therefore negating the need to apply an exemption in this case.
