// Local, SEO-facing intro copy for each /pricing/[county] page — names a
// handful of real towns plus the local demand drivers (tourism, venues,
// proximity to cities/airports) so the page reads as written for that
// county rather than a template with the name swapped in. Keyed by the
// same county name used in pricingCounties.ts.
export const COUNTY_INTROS: Record<string, string> = {
  // ---- Republic of Ireland ----
  Carlow:
    "From Carlow Town to Tullow, Muine Bheag, Borris and Graiguecullen, we manage short-term lets across County Carlow. The Blackstairs Mountains, the Barrow Way and easy access from Dublin and Kilkenny keep weekend demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Cavan:
    "From Cavan Town to Ballyjamesduff, Bailieborough, Cootehill and Kingscourt, we manage short-term lets across County Cavan. With the lakelands, Slieve Russell and easy weekend access from Dublin and Belfast, demand is steady — we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Clare:
    "From Ennis to Kilrush, Shannon, Killaloe and Lisdoonvarna, we manage short-term lets across County Clare. The Cliffs of Moher, the Wild Atlantic Way and Shannon Airport bring year-round visitors, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Cork:
    "From Cork City to Kinsale, Clonakilty, Mallow and Youghal, we manage short-term lets across County Cork. Cork Airport, the harbour towns and a packed festival calendar keep demand strong all year, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Donegal:
    "From Letterkenny to Donegal Town, Bundoran, Dungloe and Buncrana, we manage short-term lets across County Donegal. Slieve League, the surf beaches and the Wild Atlantic Way draw visitors well beyond the summer season, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Dublin:
    "From Dublin City to Dun Laoghaire, Swords, Howth and Tallaght, we manage short-term lets across County Dublin. The airport, the city's events calendar and year-round business travel keep demand high, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Galway:
    "From Galway City to Clifden, Oughterard, Salthill and Tuam, we manage short-term lets across County Galway. Connemara, the Wild Atlantic Way and the city's festival season keep visitors coming year-round, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Kerry:
    "From Killarney to Tralee, Dingle, Kenmare and Cahersiveen, we manage short-term lets across County Kerry. The Ring of Kerry, the national park and Kerry Airport bring steady tourist traffic, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Kildare:
    "From Naas to Newbridge, Maynooth, Kildare Town and Celbridge, we manage short-term lets across County Kildare. The Curragh, Punchestown and quick access to Dublin and Dublin Airport keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Kilkenny:
    "From Kilkenny City to Thomastown, Callan, Graiguenamanagh and Castlecomer, we manage short-term lets across County Kilkenny. The medieval mile, Mount Juliet and a busy events calendar keep visitors coming, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Laois:
    "From Portlaoise to Mountmellick, Portarlington, Abbeyleix and Mountrath, we manage short-term lets across County Laois. The Slieve Bloom Mountains and fast rail links to Dublin and Cork keep this a popular stopover county, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Leitrim:
    "From Carrick-on-Shannon to Manorhamilton, Ballinamore, Drumshanbo and Mohill, we manage short-term lets across County Leitrim. The Shannon-Erne waterways and the Lough Allen lakelands draw a steady stream of boating and outdoor visitors, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Limerick:
    "From Limerick City to Adare, Newcastle West, Castleconnell and Abbeyfeale, we manage short-term lets across County Limerick. Shannon Airport, Adare's visitor numbers and the city's growing business travel keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Longford:
    "From Longford Town to Granard, Ballymahon, Edgeworthstown and Lanesborough, we manage short-term lets across County Longford. The Shannon lakelands and easy access from Dublin and the Midlands keep interest steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Louth:
    "From Dundalk to Drogheda, Ardee, Carlingford and Dunleer, we manage short-term lets across County Louth. The Cooley Peninsula, the Boyne Valley and quick access from Dublin and Belfast keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Mayo:
    "From Westport to Castlebar, Achill, Ballina and Knock, we manage short-term lets across County Mayo. Croagh Patrick, the Wild Atlantic Way and Ireland West Airport bring visitors throughout the year, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Meath:
    "From Navan to Trim, Kells, Ashbourne and Laytown, we manage short-term lets across County Meath. Newgrange, the Boyne Valley and quick access from Dublin and Dublin Airport keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Monaghan:
    "From Monaghan Town to Carrickmacross, Clones and Castleblayney, we manage short-term lets across County Monaghan. The drumlin lakelands and proximity to both Dublin and Belfast keep interest steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Offaly:
    "From Tullamore to Birr, Edenderry, Banagher and Clara, we manage short-term lets across County Offaly. Birr Castle, the Slieve Bloom Mountains and the River Shannon keep a steady flow of visitors, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Roscommon:
    "From Roscommon Town to Boyle, Castlerea and Strokestown, we manage short-term lets across County Roscommon. Lough Key Forest Park and the Shannon lakelands bring a steady run of outdoor visitors, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Sligo:
    "From Sligo Town to Strandhill, Rosses Point and Enniscrone, we manage short-term lets across County Sligo. The surf beaches, Benbulben and the Wild Atlantic Way keep demand strong through the shoulder seasons, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Tipperary:
    "From Clonmel to Thurles, Nenagh, Cashel and Carrick-on-Suir, we manage short-term lets across County Tipperary. The Rock of Cashel, the Galtee Mountains and a busy GAA calendar bring visitors year-round, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Waterford:
    "From Waterford City to Dungarvan, Tramore, Lismore and Dunmore East, we manage short-term lets across County Waterford. The Copper Coast, the Comeragh Mountains and a strong summer beach season keep demand up, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Westmeath:
    "From Mullingar to Athlone, Moate and Castlepollard, we manage short-term lets across County Westmeath. The Shannon lakelands and Athlone's central location keep this a popular midlands stopover, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Wexford:
    "From Wexford Town to Gorey, Enniscorthy, New Ross and Rosslare, we manage short-term lets across County Wexford. The sunny south-east's beaches, Rosslare Europort and a busy festival calendar keep visitors coming, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Wicklow:
    "From Wicklow Town to Bray, Arklow, Greystones and Blessington, we manage short-term lets across County Wicklow. The Garden of Ireland's mountains, Glendalough and quick access from Dublin keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",

  // ---- Northern Ireland ----
  Antrim:
    "From Antrim Town to Ballymena, Larne, Carrickfergus and Lisburn, we manage short-term lets across County Antrim. The Giant's Causeway, the Glens of Antrim and Belfast International Airport bring steady visitor numbers, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Armagh:
    "From Armagh City to Lurgan, Portadown, Craigavon and Keady, we manage short-term lets across County Armagh. The orchard county's food and drink trail and quick access to Belfast and Newry keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Down:
    "From Newry to Bangor, Downpatrick, Newcastle and Holywood, we manage short-term lets across County Down. The Mourne Mountains, Strangford Lough and proximity to Belfast keep visitors coming year-round, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Fermanagh:
    "From Enniskillen to Lisnaskea, Irvinestown and Kesh, we manage short-term lets across County Fermanagh. The Lough Erne lakelands and a strong boating and angling season keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  "Derry / Londonderry":
    "From Derry city to Limavady, Coleraine and Portstewart, we manage short-term lets across County Derry/Londonderry. The Causeway Coast, the walled city and a growing events calendar keep visitors coming, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
  Tyrone:
    "From Omagh to Dungannon, Strabane and Cookstown, we manage short-term lets across County Tyrone. The Sperrins, the Ulster American Folk Park and easy access across the border keep demand steady, and we run pricing, cleaning, maintenance and guest comms so your place earns more.",
};
