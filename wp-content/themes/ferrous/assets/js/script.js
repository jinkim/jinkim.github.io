const wordpressHostName = 'wp';

const getDomainWithoutSubdomain = (url) => {
  const urlParts = new URL(url).hostname.split('.')
  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join('.')
}

const roundDownToTwoDecimals = (num) => {
  return Math.floor(num * 100) / 100;
};

const toRadians = (degrees) => {
    return degrees * Math.PI / 180;
};

// ============================================
// Get distance between two geocodes in miles
// ============================================
const getGeoDistance = (geocodeStart, geocodeEnd) => {

    if (geocodeStart && geocodeEnd) {
        const R = 3958.8; // R factor that produces result in miles
        const geocodeStartArray = geocodeStart.split(",").map(item => item.trim()).filter(item => item !== "");
        const geocodeEndArray = geocodeEnd.split(",").map(item => item.trim()).filter(item => item !== "");

        var dLat = toRadians(geocodeEndArray[0] - geocodeStartArray[0]);
        var dLon = toRadians(geocodeEndArray[1] - geocodeStartArray[1]);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(geocodeStartArray[0])) * Math.cos(toRadians(geocodeEndArray[0])) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = R * c;

        return roundDownToTwoDecimals(distance);
    }

};

// ============================================
// 
// ============================================
const initSiteHeader = () => {
    const siteHeader = document.querySelector('.site-header');
    const siteMain = document.querySelector('.site-main');

    if (siteHeader && siteMain ) {

        document.addEventListener('scroll', function() {
            if (siteMain.getBoundingClientRect().top < 0) {
                siteHeader.classList.add('is-compact');
            } else {
                siteHeader.classList.remove('is-compact');
            }
        });

        window.addEventListener('resize', function() {
            if (siteMain.getBoundingClientRect().top < 0) {
                siteHeader.classList.add('is-compact');
            } else {
                siteHeader.classList.remove('is-compact');
            }
        });
    }

};

// ==========================================================
// initDetailGroups
// ==========================================================
const initDetailGroups = () => {
    const detailGroups = document.querySelectorAll(':has(>.wp-block-details)');
    detailGroups.forEach((detailsContainer) => {
        const detailsList = detailsContainer.querySelectorAll('.wp-block-details');
        if (detailsList.length === 0) return;
        for (let details of detailsList) {
            details.addEventListener("toggle", (event) => {
                if (!event.target.open) return;
                for (let details of detailsList) {
                    details.open = details === event.target;
                }
            });
        }
    });
}; // initDetailGroups


// ==========================================================
// initLeadership
// ==========================================================
const initLeadership = () => {
   
    const leadershipProfiles = document.querySelectorAll(".leadership-block>.as-trigger");

    const openLeadershipDialog = (triggerElement) => {

        // disable scrolling of the document underneath the dialog
        // - needed even though dialog is modal
        document.documentElement.dataset.scrollOff = "true";

        // open the dialog as modal
        const matchingDialog = document.getElementById("dialog-" + triggerElement.dataset.leadershipId);

        matchingDialog.showModal();
        matchingDialog.removeAttribute("inert");
    };

    const cleanupLeadershipDialog = (dialogToClose) => {

        // re-enable scrolling of the document
        document.documentElement.removeAttribute("data-scroll-off");

        // focus back on the trigger for this dialog - recommended for accessibility
        const dialogTrigger = document.getElementById("dialog-" + dialogToClose.dataset.leadershipId);
        dialogTrigger ? dialogTrigger.focus() : "";

    };

    if (typeof HTMLDialogElement === 'function' && leadershipProfiles.length > 0) {

        leadershipProfiles.forEach(eachProfile => {

            const linkLabel = eachProfile.dataset.linkLabel || "View Bio";

            const leadershipDialogTemplate = eachProfile.querySelector('template');

            // make a clone of the leadership dialog template
            const newDialog = leadershipDialogTemplate.content.cloneNode(true).querySelector("dialog");

            // set new dialog attributes for each leadership member
            newDialog.id = "dialog-" + eachProfile.dataset.leadershipId;
            newDialog.setAttribute("aria-labelledby", "dialog-heading-" + eachProfile.dataset.leadershipId);

            // clone leadership member content into a newly created container for the dialog content
            const newDialogContent = newDialog.querySelector(".leadership-content");
            const eachLeadershipContent = eachProfile.querySelectorAll(":scope > *:not(template)");
            eachLeadershipContent.forEach(contentItem => {
                newDialogContent.appendChild(contentItem.cloneNode(true));

                if (contentItem.classList.contains("leadership-profile__info")) {
                    const leadershipTriggerLinkLabel = contentItem.appendChild(document.createElement("p"));
                    leadershipTriggerLinkLabel?.classList.add("leadership-profile__bio-link");
                    leadershipTriggerLinkLabel.innerHTML = `${linkLabel} <svg xmlns="http://www.w3.org/2000/svg" width="26" height="15" viewBox="0 0 26 15" fill="none"><path d="M25.2071 8.20711C25.5976 7.81658 25.5976 7.18342 25.2071 6.79289L18.8431 0.428932C18.4526 0.0384078 17.8195 0.0384078 17.4289 0.428932C17.0384 0.819457 17.0384 1.45262 17.4289 1.84315L23.0858 7.5L17.4289 13.1569C17.0384 13.5474 17.0384 14.1805 17.4289 14.5711C17.8195 14.9616 18.4526 14.9616 18.8431 14.5711L25.2071 8.20711ZM0.5 8.5L24.5 8.5V6.5L0.5 6.5L0.5 8.5Z" fill="#E93328"></path></svg>`;
                }
            });
            newDialog.appendChild(newDialogContent);

            // move the existing dialog close button within the template into the dialog content as last child
            const newDialogCloseButton = newDialog.querySelector(".close-button");

            // change the id of the member heading within the dialog content to match aria-labelledby
            const newDialogHeading = newDialogContent.querySelector(".leadership-profile__name");
            if (newDialogHeading) {
                newDialogHeading.id = "dialog-heading-" + eachProfile.dataset.leadershipId;
                newDialogHeading.setAttribute("autofocus", "true");
            }

            // prevent clicks within the content (visible dialog box) from propagating
            // to prevent unwanted closing of the dialog
            newDialogContent.addEventListener("click", (event) => {
                event.stopPropagation();
            });

            // because the content is essentially the same screen size, handling
            // clicks on dialog effectively only allows closing by clicking on
            // dialog's backdrop
            newDialog.addEventListener("click", (event) => {
                event.stopPropagation();
                event.currentTarget.close();
            });

            // handle click on dialog close button
            newDialogCloseButton.addEventListener("click", (event) => {
                event.stopPropagation();
                event.currentTarget.parentElement.parentElement.close();
                cleanupLeadershipDialog(event.currentTarget.parentElement.parentElement);
            });

            // handle dialog close event to perform the common cleanup
            // for all of the different ways the dialog is closed
            newDialog.addEventListener("close", (event) => {
                event.stopPropagation();
                cleanupLeadershipDialog(event.currentTarget);
            });

            // remove unnecessary bio content out of the original leadership member element
            eachProfile.querySelector(".leadership-profile__info")?.querySelectorAll("&>:not(.leadership-profile__name):not(.leadership-profile__title):not(.leadership-profile__bio-link)").forEach(item => item.remove());

            eachProfile.addEventListener("click", (event) => {
                event.stopPropagation();
                openLeadershipDialog(event.target);
            });
            eachProfile.addEventListener("keypress", (event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                    openLeadershipDialog(event.target);
                }
            });

            // append the dialog after the original list
            eachProfile.after(newDialog);
            
        });
    }

} // initLeadership


// ==========================================================
// getGeocoderUrl()
// 
// Determine the URL to the geocoder API setup in Wordpress
// per hosting environment (local, wordpress.com & static)
// ==========================================================
const getGeocoderUrl = () => {

    const domain = getDomainWithoutSubdomain(window.location.origin);
    const geoencodeApiPath = '/wp-json/ferrous/v1/geocode/';

    // local
    if (domain == 'wp.local') {
        return 'fpt-experiment.' + domain + geoencodeApiPath;

    // wordpress
    } else if (domain == 'basedon.com') {
        return 'fpt1.' + domain + geoencodeApiPath;
    }

    // static
    return wordpressHostName + '.' + domain + geoencodeApiPath;
};


// =========================================================
// getDeviceGeocode()
//
// Request geocode of the device
// =========================================================
const getDeviceGeocode = () => {

    const deviceGeocodeResult = {};

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (result) => {
                deviceGeocodeResult.status  = 'success';
                deviceGeocodeResult.geocode = result.coords.latitude + ',' + result.coords.longitude;
                deviceGeocodeResult.message = result.message || 'Geocode retrieved successfully';
            }, 
            (error) => {
                deviceGeocodeResult.status  = 'error';
                deviceGeocodeResult.message = error.message || 'Error retrieving geocode';
            }, 
            {
                enableHighAccuracy: true,
                timeout: 1000,
                maximumAge: 0
            }
        )
    }
    return deviceGeocodeResult
};


// ==========================================================
// scrapeLocationsData(locationsListItems, locationsData)
//
// Scrape the locations data from the HTML and return it as 
// an array of objects
// ==========================================================
const scrapeLocationsData = (locationsListItems) => {

    const locationsData = [];

    locationsListItems.forEach(locationItem => {

        const locationHoursList = locationItem.querySelectorAll('.location-hours-list>li');
        const locationHoursArray = [];
        locationHoursList.forEach(hours => {
            const hoursData = {
                period: hours.dataset.period,
                hours: hours.dataset.hours
            }
            locationHoursArray.push(hoursData);
        });

        const location = {
            title: locationItem.getAttribute('aria-label'),
            geocode: locationItem.dataset.geocode,
            region: locationItem.dataset.region,
            description: locationItem.querySelector('.location-description')?.innerHTML,
            address: locationItem.querySelector('.location-address')?.dataset.value,
            phone: locationItem.querySelector('.location-phone')?.dataset.value,
            fax: locationItem.querySelector('.location-fax')?.dataset.value,
            hours: locationHoursArray,
            hoursNote: locationItem.querySelector('.location-hours-note')?.innerHTML,
            tags: locationItem.querySelector('.location-features-tags')?.dataset.features,
            mapImageUrl: locationItem.querySelector('.location-static-map-image')?.getAttribute('src'),
            distance: undefined
        };

        locationsData.push(location);
    });

    return locationsData;

}; // scrapeLocationsData


// ==========================================================
// getPaginationControls(paginationProps, paginateTo)
//
// Initialize paginating of locations list (10 per page)
// ==========================================================
const getPaginationControls = (paginationProps, paginateTo) => {

    // Create pagination controls
    const paginationControls = document.createElement('nav');
    paginationControls.classList.add('pagination-controls');
    paginationControls.setAttribute('aria-label', 'Pagination Controls');
    paginationControls.dataset.currentPage = paginationProps.currentPage;
    paginationControls.dataset.itemsPerPage = paginationProps.itemsPerPage;
    paginationControls.dataset.totalPages = paginationProps.totalPages;

    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.classList.add('page-numbers');

    for (let i = 1; i <= paginationControls.dataset.totalPages; i++) {

        const pageNumber = document.createElement('span');
        pageNumber.classList.add('page-number');
        pageNumber.setAttribute('role', 'button');
        pageNumber.setAttribute('tabindex', '0');
        pageNumber.setAttribute('aria-label', 'Page ' + i);
        pageNumber.innerText = i;

        if (i === 1) {
            pageNumber.classList.add('current');
            pageNumber.setAttribute('aria-current', 'page');
        }

        pageNumber.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const previousPageNumber = pageNumbers.querySelector('.current');
            previousPageNumber.setAttribute('tabindex', '0');
            previousPageNumber.removeAttribute('aria-current');
            previousPageNumber.classList.remove('current');

            // Set current page attributes on clicked page number
            const currentPageNumber = event.target;
            currentPageNumber.setAttribute('tabindex', '-1');
            currentPageNumber.setAttribute('aria-current', 'page');
            currentPageNumber.classList.add('current');

            // Update current page in paginationProps and render the new page
            paginationControls.dataset.currentPage = currentPageNumber.innerText;

            paginateTo(paginationControls.dataset.currentPage);
        });

        pageNumbers.appendChild(pageNumber);
    }

    paginationControls.appendChild(pageNumbers);
    
    return paginationControls;
};


// ==========================================================
// listLocations(locationsData, locationsList)
//
// List the locations in the locations list
// ==========================================================
const listLocations = (locationsToDisplay, locationsList) => {

    locationsList.innerHTML = '';

    const locationTemplate = locationsList.parentElement.querySelector('.location-template');

    locationsToDisplay.forEach(location => {

        const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + location.geocode;

        newLocationListItem = locationTemplate.content.cloneNode(true).querySelector('.location');

        newLocationListItem.setAttribute('aria-label', location.title);
        newLocationListItem.querySelector('.location-title').innerHTML = location.title;

        if (location.distance > 0) {
            newLocationListItem.querySelector('.location-distance').innerHTML = location.distance + 'mi';
        }

        newLocationListItem.querySelector('.location-description').innerHTML = location.description;

        newLocationListItem.querySelector('.location-address a').setAttribute('href', mapUrl);
        newLocationListItem.querySelector('.location-address a').innerHTML = location.address.replace(/(?:\r\n|\r|\n)/g, '<br>');

        if (location.phone) {
            newLocationListItem.querySelector('.location-phone a').setAttribute('href', 'tel:' + location.phone);
            newLocationListItem.querySelector('.location-phone a').innerHTML = location.phone;    
        } else {
            newLocationListItem.querySelector('.location-phone').remove();
        }
        if (location.fax) {
            newLocationListItem.querySelector('.location-fax a').setAttribute('href', 'fax:' + location.fax);
            newLocationListItem.querySelector('.location-fax a').innerHTML = location.fax;    
        } else {
            newLocationListItem.querySelector('.location-fax').remove();
        }

        if (location.hours && location.hours.length > 0) {
            let hoursItems = '';
            location.hours.forEach(hours => {
                hoursItems += '<li><span class="period">' + hours.period + '</span><span class="hours">' + hours.hours + '</span></li>';
            });
            newLocationListItem.querySelector('.location-hours-list').innerHTML = hoursItems;

            if (location.hoursNote) {
                newLocationListItem.querySelector('.location-hours-note').innerHTML = location.hoursNote;
            } else {
                newLocationListItem.querySelector('.location-hours-note').remove();
            }

            if (!location.phone && !location.fax) {
                let hours = newLocationListItem.querySelector('.location-hours');
                hours.classList.add('span');
            }
        } else {
            newLocationListItem.querySelector('.location-hours').remove();
        }

        let featureTagsArray = location.tags?.split(',');
        let featureTags = '';
        featureTagsArray.forEach(tag => {
            if (tag != '') {
                featureTags += '<span>' + tag.trim() + '</span>';
            }
        });
        newLocationListItem.querySelector('.location-features-tags').innerHTML = featureTags;

        newLocationListItem.querySelector('.location-static-map>a').setAttribute('href', mapUrl);
        newLocationListItem.querySelector('.location-static-map-image').setAttribute('src', location.mapImageUrl);

        locationsList.appendChild(newLocationListItem);
    });
};

// ==========================================================
// updateBlockDisplay(locationsData, locationsList)
//
// Update the locations list with passed in locations
// ==========================================================
const updateBlockDisplay = (locationsData, locationsList) => {

    const paginationProps = {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: Math.ceil(locationsData.length / 10)
    };

    const paginateTo = (pageNumber) => {
        paginationProps.currentPage = pageNumber;
        const startIndex = (paginationProps.currentPage - 1) * paginationProps.itemsPerPage;
        const endIndex = startIndex + paginationProps.itemsPerPage;
        const locationsToDisplay = locationsData.slice(startIndex, endIndex);
        listLocations(locationsToDisplay, locationsList);
        locationsList.parentElement.scrollIntoView(true, { block: 'start', behavior: 'smooth' });
    };

    const paginationControls = getPaginationControls(paginationProps, paginateTo);
    if (paginationControls) {
        // Remove existing pagination controls if any
        const existingPaginationControls = locationsList.parentElement.querySelector('.pagination-controls');
        if (existingPaginationControls) {
            existingPaginationControls.remove();
        }
        locationsList.after(paginationControls);
    }

    const firstPageLocations = locationsData.slice(0, 10);
    listLocations(firstPageLocations, locationsList);
};


// ==========================================================
// updateLocationDistances(geocode)
//
// Update the distance for all locations based on the passed in geocode
// ==========================================================
const updateLocationDistances = (locationsData, targetGeolocation) => {
    locationsData.forEach(location => {
        location['distance'] = getGeoDistance(location['geocode'], targetGeolocation);
    });
};

// ==========================================================
// getFilteredLocations(locationsData, filter)
//
// Filter the locations based on the passed in filter object
// ==========================================================
const getFilteredLocations = (locationsData, filter) => {

    const filteredLocations = locationsData.filter(location => {
        let matches = true;

        if (filter.region !== 'all' && location.region !== filter.region) {
            matches = false;
        }

        if (filter.radius !== 'all' && location.distance && location.distance > filter.radius) {
            matches = false;
        }

        if (filter.features.length > 0) {
            const tagsArray = location.tags?.split(',').map(item => item.trim());
            matches = matches && filter.features.every(element => tagsArray.includes(element));
        }

        return matches;
    });

    return filteredLocations.sort( (a, b) => parseFloat(a.distance) - parseFloat(b.distance) );
};


// ==========================================================
// initLocationsSearchForm(searchForm)
//
// Update the locations list with passed in locations
// ==========================================================
const initLocationsSearchForm = (searchForm, locationsDisplayCallback) => {

    const locationsAddressInput = searchForm?.querySelector('.locations-address');
    const geocodeTriggerButton = searchForm?.querySelector('.locations-geocode-button');

    if (! searchForm || ! locationsAddressInput || ! geocodeTriggerButton) {
        return { 'status': 'error', 'message': 'Invalid search/filter form.'};
    }

    geocodeTriggerButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const geocodeResult = {};

        const watchPositionID = navigator.geolocation.watchPosition(
            (position) => {
                navigator.geolocation.clearWatch(watchPositionID);

                geocodeResult.status = 'success';
                geocodeResult.geocode = position.coords.latitude + ',' + position.coords.longitude;
                geocodeResult.message = 'Geocode detected successfully.';
                geocodeResult.detail = 'device';

                searchForm.dataset.geocode = geocodeResult.geocode;
                locationsAddressInput.setAttribute('placeholder', 'Location Detected');
                
                locationsDisplayCallback(geocodeResult);
            },
            (error) => {
                navigator.geolocation.clearWatch(watchPositionID);

                geocodeResult.status = 'error';
                geocodeResult.geocode = '';
                geocodeResult.message = 'Geocode could not be detected. ' + error.code + ': ' + error.message;
                geocodeResult.detail = 'device';

                searchForm.dataset.geocode = '';
                locationsAddressInput.setAttribute('placeholder', 'Enter Your Location');

                locationsDisplayCallback(geocodeResult);
            },
            {
                enableHighAccuracy: true,
                timeout: 2000,
                maximumAge: 0
            }
        );

    });

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const locationsAddress = locationsAddressInput.value.trim();
        const geocodeResult = {};

        if (! locationsAddress) {

            if (! searchForm.dataset.geocode) {
                geocodeResult.status = 'error';
                geocodeResult.geocode = '';
                geocodeResult.message = 'Empty address input. Please enter an address or use the target icon to detect your location.';
                geocodeResult.detail = 'form';

            } else {
                geocodeResult.status = 'success';
                geocodeResult.geocode = searchForm.dataset.geocode;
                geocodeResult.message = 'Empty address input. Used detected geocode instead.';
                geocodeResult.detail = 'form';
            }

            locationsDisplayCallback(geocodeResult);

        } else {

            const geocodeApiRequest = 'https://' + getGeocoderUrl() + '?address=' + encodeURIComponent(locationsAddress);

            fetch(geocodeApiRequest).then(apiResponse => {
                if (!apiResponse.ok) {
                    throw new Error(`Response status: ${apiResponse.status}`);
                }
                return apiResponse.json();
            }).then(apiResponseData => {
                geocodeResult.status = apiResponseData.status;
                geocodeResult.geocode = apiResponseData.geocode;
                geocodeResult.message = apiResponseData.message;
                geocodeResult.detail = 'api:' + (apiResponseData.source || '');
                
                locationsDisplayCallback(geocodeResult);

            }).catch(error => {
                geocodeResult.status = 'error';
                geocodeResult.geocode = '';
                geocodeResult.message = 'Unable to geocode location.';
                geocodeResult.detail = 'api';

                locationsDisplayCallback(geocodeResult);
            });
        }

    });
};


// ==========================================================
// getLocationFilter(searchForm)
//
// Get the filter object from the search form
// ==========================================================
const getLocationFilter = (searchForm) => {

    const filter = {
        region  : searchForm.querySelector('.locations-region-select').value,
        radius  : searchForm.querySelector('.locations-radius-select').value,
        features: []
    };

    searchForm.querySelectorAll('.location-feature-checkbox').forEach(feature => {
        if (feature.checked) {
            filter.features.push(feature.value);
        }
    });

    return filter;
};


// ==========================================================
// initLocations()
//
// Initialize the Locations blocks
// ==========================================================
const initLocations = () => {

    const locationsBlocks = document.querySelectorAll('.locations-block');
    locationsBlocks.forEach((block) => {

        const locationsListItems = block.querySelectorAll('.location');
        const locationsMessageBox = block.querySelector('.locations-message-box');

        if (locationsListItems.length === 0) {
            locationsMessageBox.innerHTML = '<p class="notice">There are no locations found in the system.</p>';
            return;
        }

        const locationsList = block.querySelector('.locations-list');
        const locationsData = scrapeLocationsData(locationsListItems);
        
        const locationsSearchForm = block.querySelector('.locations-search-form');

        const searchCallback = (geocodeResult) => {

            if (geocodeResult.status === 'success') {
                updateLocationDistances(locationsData, geocodeResult.geocode);

                if (geocodeResult.detail !== 'device') {
                    const filter = getLocationFilter(locationsSearchForm);
                    const filteredLocations = getFilteredLocations(locationsData, filter);

                    if (filteredLocations.length !== 0) {
                        geocodeResult.message =  filteredLocations.length + ' matching locations found. ' + geocodeResult.message;
                        updateBlockDisplay(filteredLocations, locationsList);
                    } else {
                        geocodeResult.message = 'No matching location found.';
                    }
                }
            }

            locationsMessageBox.innerHTML = '<p class="' + geocodeResult.status + '">' + geocodeResult.message + '</p>';
        };

        initLocationsSearchForm(locationsSearchForm, searchCallback);

        // scrape and re-display the locations for the first time
        locationsList.innerHTML = '';
        updateBlockDisplay(locationsData, locationsList); 
    });

} // initLocations

// =======================================
// initContactForms
// =======================================
const initContactForms = () => {

    const contactForms = document.querySelectorAll('.fpt-form');

    contactForms.forEach(form => {

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const submittedForm = event.target;

            if (! submittedForm.checkValidity()) {
                const responseContainer = submittedForm.querySelector('.response');
                responseContainer.innerHTML = '<p class="error">At least one form is invalid (highlighted in red).  Please correct and try again.</p>';
            } else {
                submittedForm.submit();
            }
        });
    });

}

document.onreadystatechange = () => {
    switch (document.readyState) {        
        case "complete":
            initSiteHeader();
            initDetailGroups();
            initLeadership();
            initLocations();
            initContactForms();
            break;
    }
};