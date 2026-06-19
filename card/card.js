document.addEventListener('DOMContentLoaded', async () => {
    // Determine environment for API URL
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';
    const API_BASE = isLocalhost ? 'http://127.0.0.1:1337' : 'https://cms.rlcadvocates.co.ke'; 
    
    // Default member data fallback
    let memberData = {
        firstName: 'RLC',
        lastName: 'Advocates',
        fullName: 'RLC Advocates',
        role: 'Legal Team',
        company: 'RLC Advocates LLP',
        phoneCell: '0207 800800',
        officeNumber: '0207 800800 | 0115 800800',
        officeLocation: 'Blue Shield Towers, 5th floor, Upperhill - Hospital Road, Nairobi',
        email: 'info@rlcadvocates.co.ke',
        website: 'https://rlcadvocates.co.ke',
        profilePhotoUrl: '../Images/avatar-placeholder.svg'
    };

    // Get the slug from URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    const cardContainer = document.getElementById('card-wrapper');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (!slug) {
        // Handle error: no slug provided
        document.getElementById('card-name').textContent = "Profile Not Found";
        document.getElementById('card-role').textContent = "Invalid Link";
        loadingOverlay.classList.add('opacity-0');
        setTimeout(() => loadingOverlay.classList.add('hidden'), 500);
        cardContainer.classList.remove('opacity-0');
        return;
    }

    try {
        // Fetch from the new Strapi "Cards" collection
        const response = await fetch(`${API_BASE}/api/cards?filters[slug][$eq]=${slug}&populate=*`);
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            document.getElementById('card-name').textContent = "Profile Not Found";
            document.getElementById('card-role').textContent = "The requested profile does not exist.";
        } else {
            const card = data.data[0];

            // Parse names (assume first word is first name, rest is last name)
            const nameParts = card.name.split(' ');
            memberData.firstName = nameParts[0] || '';
            memberData.lastName = nameParts.slice(1).join(' ') || '';
            memberData.fullName = card.name;
            memberData.role = card.role;
            
            if (card.email) memberData.email = card.email;
            if (card.phone_number) memberData.phoneCell = card.phone_number;
            if (card.office_number) memberData.officeNumber = card.office_number;
            if (card.office_location) memberData.officeLocation = card.office_location;
            if (card.website) memberData.website = card.website;
            else memberData.website = `https://rlcadvocates.co.ke/team/?slug=${slug}`;

            // Populate DOM
            document.getElementById('card-name').textContent = card.name;
            document.getElementById('card-role').textContent = card.role;
            document.title = `${card.name} | Digital Business Card - RLC Advocates`;
            
            if (card.profile_image && card.profile_image.url) {
                memberData.profilePhotoUrl = `${API_BASE}${card.profile_image.url}`;
                document.getElementById('card-photo').src = memberData.profilePhotoUrl;
            } else {
                document.getElementById('card-photo').src = '../Images/avatar-placeholder.svg';
            }

            // Email
            if (card.email) {
                document.getElementById('card-email').textContent = card.email;
                document.getElementById('container-email').classList.remove('hidden');
            }

            // Mobile Phone
            if (card.phone_number) {
                document.getElementById('card-phone').textContent = card.phone_number;
                document.getElementById('container-phone').classList.remove('hidden');
            }

            // Office Number (Update DOM)
            if (card.office_number) {
                const officePhoneEl = document.getElementById('card-office-phone');
                if (officePhoneEl) {
                    officePhoneEl.innerHTML = card.office_number.replace(/\|/g, '<span class="mx-1">|</span>');
                    document.getElementById('container-office-phone').classList.remove('hidden');
                }
            }

            // Office Location (Update DOM)
            if (card.office_location) {
                const officeLocEl = document.getElementById('card-office-location');
                if (officeLocEl) {
                    officeLocEl.innerHTML = card.office_location.replace(/\n/g, '<br>');
                    document.getElementById('container-office-location').classList.remove('hidden');
                }
            }

            // Socials
            if (card.linkedin) {
                const ln = document.getElementById('social-linkedin');
                ln.href = card.linkedin;
                ln.classList.remove('hidden');
            }
            if (card.x_twitter) {
                const tw = document.getElementById('social-twitter');
                tw.href = card.x_twitter;
                tw.classList.remove('hidden');
            }
            if (card.whatsapp) {
                const wa = document.getElementById('social-whatsapp');
                // Allow direct link if they put wa.me, otherwise format number
                let waLink = card.whatsapp;
                if (!waLink.includes('wa.me') && !waLink.includes('http')) {
                    waLink = `https://wa.me/${card.whatsapp.replace(/[^\d+]/g, '')}`;
                }
                wa.href = waLink;
                wa.classList.remove('hidden');
            }
            
            // Website
            const web = document.getElementById('social-website');
            web.href = memberData.website;
            web.classList.remove('hidden');

            // Show interactive elements now that profile has loaded
            document.getElementById('btn-save-contact').classList.remove('hidden');
            document.getElementById('social-links-container').classList.remove('hidden');
            const topShareBtn = document.getElementById('btn-share-profile');
            if (topShareBtn) topShareBtn.classList.remove('hidden');
        }

    } catch (e) {
        console.error("Failed to load profile", e);
        document.getElementById('card-name').textContent = "Error Loading Profile";
        document.getElementById('card-role').textContent = "Please try again later.";
    }

    // Hide loading overlay, show card
    loadingOverlay.classList.add('opacity-0');
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        cardContainer.classList.remove('opacity-0');
    }, 500);

    // Generate vCard dynamically
    const generateVCard = (base64Photo, includePhoto = true) => {
        let photoLine = '';
        if (includePhoto) {
            photoLine = base64Photo ? `PHOTO;ENCODING=b;TYPE=JPEG:${base64Photo}` : `PHOTO;VALUE=URI:${memberData.profilePhotoUrl}`;
        }
        
        // Format office numbers (split by pipe if multiple)
        const officeNumbers = memberData.officeNumber.split('|').map(n => n.trim());
        const officeTelLines = officeNumbers.map(n => `TEL;TYPE=OFFICE:${n}`).join('\r\n');
        
        // Format office address (very basic single line ADR, or map from commas)
        const addressLine = memberData.officeLocation.replace(/,/g, '\\,').replace(/\n/g, ' ');

        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `N:${memberData.lastName};${memberData.firstName};;;`,
            `FN:${memberData.fullName}`,
            `ORG:${memberData.company};`,
            `TITLE:${memberData.role}`,
            photoLine,
            `TEL;TYPE=CELL,VOICE:${memberData.phoneCell}`,
            officeTelLines,
            `EMAIL;TYPE=WORK,INTERNET:${memberData.email}`,
            `URL:${memberData.website}`,
            `ADR;TYPE=OFFICE ADDRESS:;;${addressLine};;;;`,
            "END:VCARD"
        ].join("\r\n");
    };

    const qrUrl = `https://rlcadvocates.co.ke/card/?slug=${slug}`; // Always point to production, even when generating from dev

    const renderQR = () => {
        const qrContainer = document.getElementById('qrcode');
        try {
            if (typeof QRCode !== 'undefined' && qrContainer) {
                qrContainer.innerHTML = '';
                new QRCode(qrContainer, {
                    text: qrUrl,
                    width: 512, 
                    height: 512,
                    colorDark : "#111827",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.M
                });
                
                setTimeout(() => {
                    const qrImg = qrContainer.querySelector('img');
                    const qrCanvas = qrContainer.querySelector('canvas');
                    if(qrImg) { qrImg.style.width = '100%'; qrImg.style.height = '100%'; }
                    if(qrCanvas) { qrCanvas.style.width = '100%'; qrCanvas.style.height = '100%'; }
                }, 100);
            }
        } catch (e) {
            console.error("Failed to generate QR Code:", e);
        }
    };

    const setupDownload = (vCardString) => {
        const saveContactBtn = document.getElementById('btn-save-contact');
        if (saveContactBtn) {
            saveContactBtn.onclick = async (e) => {
                e.preventDefault();
                const fileName = `${memberData.firstName}_${memberData.lastName}.vcf`;
                const blob = new Blob([vCardString], { type: "text/vcard;charset=utf-8;" });

                // 1. Direct Download / Native Open
                // Android Chrome blocks sharing .vcf files via Web Share API, so we skip it here.
                const url = URL.createObjectURL(blob);
                
                // On iOS, navigating directly to the blob URL triggers the native Contacts sheet instantly.
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                
                if (isIOS) {
                    window.location.href = url;
                } else {
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => { document.body.removeChild(link); }, 100);
                }
                
                setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            };
        }

        const qrBlock = document.getElementById('qr-block');
        if (qrBlock) {
            qrBlock.onclick = () => {
                navigator.clipboard.writeText(qrUrl).then(() => {
                    const originalTitle = qrBlock.getAttribute('title');
                    qrBlock.setAttribute('title', 'Link Copied!');
                    qrBlock.classList.add('bg-green-50');
                    setTimeout(() => {
                        qrBlock.setAttribute('title', originalTitle);
                        qrBlock.classList.remove('bg-green-50');
                    }, 2000);
                });
            };
        }
    };

    // Prepare Base64 Image for vCard
    const prepareImageAndDownload = () => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const MAX_SIZE = 200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const dataURL = canvas.toDataURL("image/jpeg", 0.7);
            const base64Data = dataURL.replace(/^data:image\/(png|jpeg);base64,/, "");
            
            setupDownload(generateVCard(base64Data));
        };
        
        img.onerror = function() {
            console.warn("Could not load image for vCard.");
            setupDownload(generateVCard(null));
        };
        
        img.src = memberData.profilePhotoUrl;
    };

    const renderQRBack = (vCardString) => {
        const qrContainer = document.getElementById('qrcode-back');
        try {
            if (typeof QRCode !== 'undefined' && qrContainer) {
                qrContainer.innerHTML = '';
                new QRCode(qrContainer, {
                    text: vCardString,
                    width: 512, 
                    height: 512,
                    colorDark : "#111827",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.L // Low error correction since vCard data is dense
                });
                
                setTimeout(() => {
                    const qrImg = qrContainer.querySelector('img');
                    const qrCanvas = qrContainer.querySelector('canvas');
                    if(qrImg) { qrImg.style.width = '100%'; qrImg.style.height = '100%'; }
                    if(qrCanvas) { qrCanvas.style.width = '100%'; qrCanvas.style.height = '100%'; }
                }, 100);
            }
        } catch (e) {
            console.error("Failed to generate Back QR Code:", e);
        }
    };

    // Flip Logic
    const btnFlipToBack = document.getElementById('btn-flip-to-back');
    const btnFlipToFront = document.getElementById('btn-flip-to-front');
    const cardInner = document.getElementById('business-card');
    const cardFront = document.getElementById('card-front');
    const cardBack = document.getElementById('card-back');

    if (btnFlipToBack && cardInner) {
        btnFlipToBack.onclick = () => {
            cardInner.classList.add('flipped');
            if (cardFront) cardFront.style.pointerEvents = 'none';
            if (cardBack) cardBack.style.pointerEvents = 'auto';
        };
    }
    if (btnFlipToFront && cardInner) {
        btnFlipToFront.onclick = () => {
            cardInner.classList.remove('flipped');
            if (cardFront) cardFront.style.pointerEvents = 'auto';
            if (cardBack) cardBack.style.pointerEvents = 'none';
        };
    }

    // Share Logic
    const btnShareProfile = document.getElementById('btn-share-profile');
    if (btnShareProfile) {
        btnShareProfile.onclick = async () => {
            const shareData = {
                title: `${memberData.fullName} | RLC Advocates`,
                text: `Digital Business Card: ${memberData.fullName}, ${memberData.role} at RLC Advocates.`,
                url: window.location.href
            };

            if (navigator.share && navigator.canShare(shareData)) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.log("Share cancelled", err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Profile link copied to clipboard!");
                } catch (err) {
                    console.error("Failed to copy", err);
                }
            }
        };
    }

    // Download PNG Logic
    const btnDownloadPng = document.getElementById('btn-download-png');
    if (btnDownloadPng) {
        // Only show the download button in the development environment
        if (!isLocalhost) {
            btnDownloadPng.style.display = 'none';
        } else {
            btnDownloadPng.onclick = async (e) => {
                e.preventDefault();
                
                const btnSave = document.getElementById('btn-save-contact');
            const btnFlip = document.getElementById('btn-flip-to-back');
            const btnShare = document.getElementById('btn-share-profile');
            const socialLinks = document.getElementById('social-links-container');
            const front = document.getElementById('card-front');
            
            // Temporarily hide the buttons and social links (this shrinks the card nicely)
            if (btnSave) btnSave.style.display = 'none';
            if (btnFlip) btnFlip.style.display = 'none';
            if (btnShare) btnShare.style.display = 'none';
            if (socialLinks) socialLinks.style.display = 'none';

            // Save original styles that might affect html2canvas
            const oldTransform = front.style.transform;
            front.style.transform = 'none';
            
            let localBase64Url = null;
            try {
                // Pre-fetch the image as base64 to completely bypass html2canvas CORS tainting on production servers.
                // We must use a cache-busting query parameter and explicit 'cors' mode, otherwise the browser 
                // will return a cached "opaque" image from the initial page load, which breaks the canvas!
                const photoEl = document.getElementById('card-photo');
                if (photoEl && photoEl.src && photoEl.src.startsWith('http')) {
                    const bypassCacheUrl = `${photoEl.src}${photoEl.src.includes('?') ? '&' : '?'}v=${new Date().getTime()}`;
                    const res = await fetch(bypassCacheUrl, { 
                        mode: 'cors', 
                        cache: 'no-cache' 
                    });
                    const blob = await res.blob();
                    localBase64Url = await new Promise(resolve => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }
            } catch (err) {
                console.warn('Failed to pre-fetch profile image natively, attempting proxy fallback...', err);
                try {
                    // Ultimate fallback: If the production server strictly blocks CORS, 
                    // route the request through a public CORS proxy to strip the security headers.
                    const photoEl = document.getElementById('card-photo');
                    if (photoEl && photoEl.src) {
                        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(photoEl.src)}`;
                        const res = await fetch(proxyUrl);
                        const blob = await res.blob();
                        localBase64Url = await new Promise(resolve => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    }
                } catch (proxyErr) {
                    console.error('CORS Proxy fallback completely failed:', proxyErr);
                }
            }
            
            try {
                // Wait briefly for DOM to reflow
                await new Promise(resolve => setTimeout(resolve, 50));

                const canvas = await html2canvas(front, {
                    scale: 3, // High resolution
                    useCORS: true, // Allow cross-origin images (like the avatar)
                    backgroundColor: null, // Transparent background to preserve rounded corners
                    logging: false,
                    onclone: (clonedDoc) => {
                        // Mathematical simulation of object-fit: cover + object-position: top
                        // This prevents html2canvas from dropping image quality while ensuring perfect aspect ratios.
                        const img = clonedDoc.getElementById('card-photo');
                        if (img) {
                            if (localBase64Url) {
                                img.src = localBase64Url;
                            }
                            const parent = img.parentElement;
                            const cw = parent.offsetWidth;
                            const ch = parent.offsetHeight;
                            const iw = img.naturalWidth || cw;
                            const ih = img.naturalHeight || ch;

                            const containerRatio = cw / ch;
                            const imgRatio = iw / ih;

                            parent.style.overflow = 'hidden';
                            parent.style.position = 'relative';

                            img.style.position = 'absolute';
                            img.style.maxWidth = 'none';
                            img.style.maxHeight = 'none';
                            img.style.objectFit = 'fill'; // Disable buggy native handling

                            if (imgRatio > containerRatio) {
                                // Image is wider than container
                                img.style.height = ch + 'px';
                                img.style.width = (ch * imgRatio) + 'px';
                                img.style.left = ((cw - (ch * imgRatio)) / 2) + 'px';
                                img.style.top = '0px';
                            } else {
                                // Image is taller than container
                                img.style.width = cw + 'px';
                                img.style.height = (cw / imgRatio) + 'px';
                                img.style.top = '0px'; // object-position: top
                                img.style.left = '0px';
                            }
                        }

                        // Ensure the website row is visible in the downloaded image (it's hidden on the live site)
                        const websiteContainer = clonedDoc.getElementById('container-card-website');
                        if (websiteContainer) {
                            websiteContainer.classList.remove('hidden');
                            websiteContainer.classList.add('flex');
                        }

                        // Fix html2canvas text baseline bug (it renders text slightly too low in flex containers)
                        // By slightly bumping them up in the clone, the final PNG looks perfectly vertically centered.
                        const contactSpans = clonedDoc.querySelectorAll('#card-email, #card-phone, #card-office-phone, #card-office-location, #card-website-text');
                        contactSpans.forEach(span => {
                            span.style.display = 'inline-block';
                            span.style.transform = 'translateY(-2px)';
                        });
                    }
                });

                // Trigger direct download
                const link = document.createElement('a');
                link.download = `${memberData.fullName.replace(/\s+/g, '_')}_Business_Card.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("Failed to generate image:", err);
                alert("Failed to generate image. Please try again.");
            } finally {
                // Restore elements
                if (btnSave) btnSave.style.display = '';
                if (btnFlip) btnFlip.style.display = '';
                if (btnShare) btnShare.style.display = '';
                if (socialLinks) socialLinks.style.display = '';
                front.style.transform = oldTransform;
            }
        };
    }
}

    // Render back QR instantly without waiting for image conversion (exclude photo)
    renderQRBack(generateVCard(null, false));

    prepareImageAndDownload();
    renderQR();
});
