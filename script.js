document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const fieldsets = Array.from(form.querySelectorAll('.form-step'));
    const progressBar = document.getElementById('progressBar');
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const resetBtn = document.getElementById('resetBtn');
    const submitBtn = document.getElementById('submitBtn');
    const langEnSpan = document.getElementById('lang-en');
    const langTrSpan = document.getElementById('lang-tr');
    const emailError = document.getElementById('emailError'); // Get the email error span

    let currentStep = 0; // Tracks the current active form step (0-indexed)
    let currentLanguage = 'en'; // 'en' for English, 'tr' for Turkish

    // Object to store system messages
    const systemMessages = {
        en: {
            emailRequired: 'Email is required.',
            emailInvalid: 'Please enter a valid email address.',
            fieldRequired: 'This field is required.',
            selectOption: 'Please select an option.',
            resetConfirm: 'Are you sure you want to reset the form?',
            submissionSuccess: 'Your submission has been received!',
            submissionError: 'There was an error submitting your form. Please try again.'
        },
        tr: {
            emailRequired: 'E-posta adresi gerekli.',
            emailInvalid: 'Lütfen geçerli bir e-posta adresi girin.',
            fieldRequired: 'Bu alan gerekli.',
            selectOption: 'Lütfen bir seçenek seçin.',
            resetConfirm: 'Formu sıfırlamak istediğinizden emin misiniz?',
            submissionSuccess: 'Gönderiminiz alındı!',
            submissionError: 'Formunuzu gönderirken bir hata oluştu. Lütfen tekrar deneyin.'
        }
    };

    // --- Core Functions ---

    /**
     * Displays the current form step and updates button visibility.
     */
    const showCurrentStep = () => {
        fieldsets.forEach((fieldset, index) => {
            fieldset.classList.toggle('active', index === currentStep);
        });
        updateProgressBar();
        updateButtonVisibility();
        updateOtherTextFields(); // Ensure 'other' fields are shown/hidden on step change
    };

    /**
     * Updates the progress bar based on the current step.
     */
    const updateProgressBar = () => {
        const progress = (currentStep / (fieldsets.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    };

    /**
     * Adjusts the visibility of navigation buttons based on the current step.
     */
    const updateButtonVisibility = () => {
        // Start button only on step 0
        startBtn.style.display = currentStep === 0 ? 'block' : 'none';

        // Back button always on the left, visible after step 0 and before last step
        backBtn.style.display = currentStep > 0 && currentStep < fieldsets.length - 1 ? 'inline-block' : 'none';

        // Next button visible before the second-to-last step
        nextBtn.style.display = currentStep < fieldsets.length - 2 ? 'inline-block' : 'none';

        // Submit button visible only on the second-to-last step
        submitBtn.style.display = currentStep === fieldsets.length - 2 ? 'inline-block' : 'none';

        // Reset button always on the right, visible after step 0 and before last step
        resetBtn.style.display = currentStep > 0 && currentStep < fieldsets.length - 1 ? 'inline-block' : 'none';

        // Hide main action buttons (start/next/submit) on the "Thank you" step
        if (currentStep === fieldsets.length - 1) {
            startBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            backBtn.style.display = 'none'; // Also hide back button on thank you
            resetBtn.style.display = 'none'; // And reset button on thank you
        }
    };

    /**
     * Validates the inputs in the current active step.
     * @returns {boolean} True if all required fields are valid, false otherwise.
     */
    const validateCurrentStep = () => {
        const currentFieldset = fieldsets[currentStep];
        let isValid = true;
        const requiredInputs = Array.from(currentFieldset.querySelectorAll('[required]'));

        // Handle email validation for step 2 specifically
        if (currentStep === 1) {
            const emailInput = currentFieldset.querySelector('#email');
            if (emailInput) {
                if (!emailInput.value.trim()) {
                    emailError.textContent = systemMessages[currentLanguage].emailRequired;
                    isValid = false;
                } else if (!emailInput.validity.valid) {
                    emailError.textContent = systemMessages[currentLanguage].emailInvalid;
                    isValid = false;
                } else {
                    emailError.textContent = ''; // Clear error
                }
            }
        }

        // General validation for required fields
        for (const input of requiredInputs) {
            const type = input.type;
            const name = input.name;

            if (type === 'radio' || type === 'checkbox') {
                const group = currentFieldset.querySelectorAll(`[name="${name}"]`);
                // Check if the current required input is visible/active (e.g., if it's an "other_text" field)
                if (input.style.display === 'none' && input.classList.contains('other-text-input')) {
                     // If it's a hidden 'other' text input, don't validate it
                     input.setCustomValidity('');
                     continue;
                }
                const isChecked = Array.from(group).some(i => i.checked);
                if (!isChecked) {
                    isValid = false;
                    // Use setCustomValidity to show browser's native message
                    input.setCustomValidity(systemMessages[currentLanguage].selectOption);
                } else {
                    input.setCustomValidity('');
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.setCustomValidity(systemMessages[currentLanguage].fieldRequired);
            } else {
                input.setCustomValidity('');
            }
            input.reportValidity(); // Show native browser validation message
        }
        return isValid;
    };


    /**
     * Handles the display logic for "Other" text input fields.
     */
    const updateOtherTextFields = () => {
        const currentFieldset = fieldsets[currentStep];
        const otherRadios = currentFieldset.querySelectorAll('input[type="radio"][value="Other"]');
        const otherCheckboxes = currentFieldset.querySelectorAll('input[type="checkbox"][value="Other"]');

        [...otherRadios, ...otherCheckboxes].forEach(input => {
            const otherTextInput = input.nextElementSibling.nextElementSibling; // The input after the label
            if (otherTextInput && otherTextInput.classList.contains('other-text-input')) {
                otherTextInput.style.display = input.checked ? 'inline-block' : 'none';
                otherTextInput.required = input.checked; // Make required if visible
                if (!input.checked) {
                    otherTextInput.value = ''; // Clear value if hidden
                }
            }
        });
    };

    /**
     * Handles the conditional display of the volunteer support section (Step 17).
     */
    const handleVolunteerSupportVisibility = () => {
        const volunteerCheckbox = document.getElementById('pref_volunteer');
        const volunteerSupportSection = document.getElementById('volunteerSupportSection');
        if (volunteerCheckbox && volunteerSupportSection) {
            if (volunteerCheckbox.checked) {
                volunteerSupportSection.style.display = 'block';
                // Make inputs within this section required when visible
                Array.from(volunteerSupportSection.querySelectorAll('input[type="checkbox"]')).forEach(input => {
                    input.required = true;
                });
            } else {
                volunteerSupportSection.style.display = 'none';
                // Make inputs within this section not required when hidden
                Array.from(volunteerSupportSection.querySelectorAll('input[type="checkbox"]')).forEach(input => {
                    input.required = false;
                    input.checked = false; // Uncheck them if the section is hidden
                });
                const otherTextInput = volunteerSupportSection.querySelector('#vol_other_text');
                if(otherTextInput) {
                    otherTextInput.style.display = 'none';
                    otherTextInput.value = '';
                    otherTextInput.required = false;
                }
            }
        }
    };

    /**
     * Switches the language of the form.
     * @param {string} lang The language code ('en' or 'tr').
     */
    const switchLanguage = (lang) => {
        currentLanguage = lang;
        langEnSpan.classList.toggle('active', lang === 'en');
        langTrSpan.classList.toggle('active', lang === 'tr');

        document.querySelectorAll('[data-lang-en]').forEach(element => {
            if (lang === 'en') {
                element.textContent = element.dataset.langEn;
            } else {
                element.textContent = element.dataset.langTr;
            }
        });

        // Update button texts
        startBtn.textContent = lang === 'en' ? startBtn.dataset.langEn : startBtn.dataset.langTr;
        nextBtn.textContent = lang === 'en' ? nextBtn.dataset.langEn : nextBtn.dataset.langTr;
        backBtn.textContent = lang === 'en' ? backBtn.dataset.langEn : backBtn.dataset.langTr;
        resetBtn.textContent = lang === 'en' ? resetBtn.dataset.langEn : resetBtn.dataset.langTr;
        submitBtn.textContent = lang === 'en' ? submitBtn.dataset.langEn : submitBtn.dataset.langTr;

        // Re-validate the current step to update any visible error messages
        // This is important for real-time validation feedback to update language
        validateCurrentStep();
    };

    // --- Event Listeners ---

    // Start Button
    startBtn.addEventListener('click', () => {
        currentStep = 1; // Move to the first actual question step
        showCurrentStep();
    });

    // Next Button
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStep++;
            showCurrentStep();
        }
    });

    // Back Button
    backBtn.addEventListener('click', () => {
        currentStep--;
        showCurrentStep();
    });

    // Reset Button
    resetBtn.addEventListener('click', () => {
        // Use the systemMessages object for the confirmation message
        if (confirm(systemMessages[currentLanguage].resetConfirm)) {
            form.reset(); // Resets all form fields
            currentStep = 0; // Go back to the welcome step
            showCurrentStep();
            // Clear any lingering error messages
            emailError.textContent = '';
            // Reset 'other' text inputs visibility
            Array.from(form.querySelectorAll('.other-text-input')).forEach(input => {
                input.style.display = 'none';
                input.value = '';
                input.required = false;
            });
            handleVolunteerSupportVisibility(); // Reset volunteer section visibility
        }
    });

    // Submit Button (AJAX Submission to Formspree)
    submitBtn.addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default form submission (important!)

        if (!validateCurrentStep()) {
            // If validation fails, stop here
            return;
        }

        // Show the "Thank you" step immediately after validation passes
        currentStep = fieldsets.length - 1;
        showCurrentStep();

        // Collect form data
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            // Handle multiple checkboxes with the same name
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Formspree returns 200 OK on success
                console.log(systemMessages[currentLanguage].submissionSuccess);
                // No further action needed here, as the "Thank you" step is already shown.
                // You might want to clear the form here if you allow multiple submissions
                // or if the user can go back, but for a one-time submission, it's fine.
            } else {
                // Handle Formspree errors (e.g., rate limits, invalid form ID)
                const errorData = await response.json();
                console.error(systemMessages[currentLanguage].submissionError, errorData);
                // Optionally revert to the submit step or show an error message on the page
                currentStep = fieldsets.length - 2; // Go back to submit step
                showCurrentStep();
                alert(systemMessages[currentLanguage].submissionError);
            }
        } catch (error) {
            console.error(systemMessages[currentLanguage].submissionError, error);
            // Optionally revert to the submit step or show an error message on the page
            currentStep = fieldsets.length - 2; // Go back to submit step
            showCurrentStep();
            alert(systemMessages[currentLanguage].submissionError);
        }
    });


    // Language Toggle
    langEnSpan.addEventListener('click', () => switchLanguage('en'));
    langTrSpan.addEventListener('click', () => switchLanguage('tr'));

    // Event delegation for radio/checkbox changes within fieldsets
    form.addEventListener('change', (event) => {
        const target = event.target;
        // Handle "Other" text input visibility
        if ((target.type === 'radio' || target.type === 'checkbox') && target.value === 'Other') {
            updateOtherTextFields();
        } else if (target.type === 'radio' || target.type === 'checkbox') {
            // For other radio/checkboxes in the same group, ensure 'other' text is hidden if "Other" is deselected
            const groupName = target.name;
            const otherInputInGroup = document.querySelector(`input[name="${groupName}"][value="Other"]`);
            if (otherInputInGroup && !otherInputInGroup.checked) {
                const otherTextInput = otherInputInGroup.nextElementSibling.nextElementSibling;
                if (otherTextInput && otherTextInput.classList.contains('other-text-input')) {
                    otherTextInput.style.display = 'none';
                    otherTextInput.value = '';
                    otherTextInput.required = false;
                }
            }
        }

        // Handle conditional volunteer support section
        if (target.id === 'pref_volunteer' || target.id === 'pref_none' || target.id === 'pref_sponsor') {
            handleVolunteerSupportVisibility();
        }
    });

    // Initial setup
    showCurrentStep(); // Show the first step on page load
    switchLanguage('en'); // Set initial language to English
    handleVolunteerSupportVisibility(); // Set initial visibility for volunteer section
});
