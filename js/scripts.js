document.addEventListener("DOMContentLoaded", function() {

	//fancybox
	Fancybox.bind("[data-fancybox]", {
		//settings
	});



	// datepicker
	const dateInputs = document.querySelectorAll('.js-date-input');
	dateInputs.forEach(dateInput => {
		const popupBlockDate = dateInput.closest('.js-popup-wrap')?.querySelector('.js-date-inner');
		if (popupBlockDate) {
			const calendar = flatpickr(popupBlockDate, {
			inline: true,
			dateFormat: "d.m.Y",
			locale: "ru",
			yearSelector: false,
			static: true,
			monthSelectorType: "static",
			onChange: function(selectedDates, dateStr, instance) {
				dateInput.value = dateStr;
			}
			});
		}
	});

	// timepicker
	const timeInputs = document.querySelectorAll('.js-time-input');
	timeInputs.forEach(timeInput => {
		const popupBlockTime = timeInput.closest('.js-popup-wrap')?.querySelector('.js-time-inner');
		if (popupBlockTime) {
			const timePicker = flatpickr(popupBlockTime, {
			inline: true,
			enableTime: true,      
			noCalendar: true,      
			dateFormat: "H:i",     
			time_24hr: true,       
			locale: "ru",
			minuteIncrement: 5,    
			defaultHour: 12,       
			defaultMinute: 0,      
			onChange: function(selectedDates, dateStr, instance) {
				timeInput.value = dateStr;
			}
			});
		}
	});



	// filter actions
	const filterButtonOpen = document.querySelector('.js-filter-open');
	const filterButtonClose = document.querySelector('.js-filter-close');
	if (filterButtonOpen) {
		filterButtonOpen.addEventListener("click", function(event) {
				document.body.classList.add("filter-show");
				event.preventDefault();
		})
	}
	if (filterButtonClose) {
		filterButtonClose.addEventListener("click", function(event) {
				document.body.classList.remove("filter-show");
				event.preventDefault();
		})
	}


	//select toggle content visibility
	const inputs = document.querySelectorAll(
	"input[data-content], input[data-content-check], input[data-content-uncheck]"
	);

	inputs.forEach(function (input) {
	toggleContent(input);
	});

	inputs.forEach((input) => {
	input.addEventListener("click", function () {
		document.querySelectorAll(".frm-content").forEach((content) => {
		content.classList.remove("active");
			});

		inputs.forEach(toggleContent);
		});
	});

	document.querySelectorAll(".btn[data-content]").forEach((button) => {
	button.addEventListener("click", function () {
		let dataContent = this.getAttribute("data-content");
		this.disabled = true;
		document
		.querySelectorAll('.frm-content[data-content="' + dataContent + '"]')
		.forEach((content) => {
			content.classList.add("active");
			});
		return false;
		});
	});

	function toggleContent(input) {
	let selectContent;
	if (input.checked) {
		selectContent =
		input.getAttribute("data-content-check") ||
		input.getAttribute("data-content");
		} else {
		selectContent = input.getAttribute("data-content-uncheck");
		}
	document
		.querySelectorAll('.frm-content[data-content="' + selectContent + '"]')
		.forEach((content) => {
		content.classList.add("active");
		});
	}



	//range slider
	const sliderRange = document.getElementById('range-slider');
	const minInput = document.getElementById('input-number-min');
	const maxInput = document.getElementById('input-number-max');
	
	const minRange = 0;
	const maxRange = 50000;
	
	if (sliderRange) {
		noUiSlider.create(sliderRange, {
			start: [95, 25000],
			connect: true,
			range: {
				'min': [minRange],
				'max': [maxRange]
			},
			tooltips: false,
			format: {
				to: function (value) {
					return Math.round(value).toString();
				},
				from: function (value) {
					return Number(value);
				}
			},
		});
		sliderRange.noUiSlider.on('update', (values, handle) => {
			const value = values[handle];
	
			if (handle === 0) {
				minInput.textContent = Math.round(value);
			} else {
				maxInput.textContent = Math.round(value);
			}
		});
		
	}


	//files add
	const fileBlocks = document.querySelectorAll('.js-field-file');
	if (fileBlocks) {
		fileBlocks.forEach(fileBlock => {
			const fileInput = fileBlock.querySelector('.js-field-input');
			const fileAttachButton = fileBlock.querySelector('.js-file-button-attach');
			const fileDeleteButton = fileBlock.querySelector('.js-file-button-del');
			const fileName = fileBlock.querySelector('.file-name');
		
			fileAttachButton.addEventListener('click', function() {
				fileInput.click();
			});
		
			fileInput.addEventListener('change', function() {
				if (fileInput.files.length > 0) {
					fileName.textContent = fileInput.files[0].name;
					fileBlock.classList.add('file-active');
				} else {
					fileName.textContent = '';
					fileBlock.classList.remove('file-active');
				}
			});
		
			fileDeleteButton.addEventListener('click', function(e) {
				e.preventDefault();
				fileName.textContent = '';
				fileBlock.classList.remove('file-active');
				fileInput.value = null;
			});
		});
	}

	//header menu
	const overlay = document.getElementById('overlay');
	function closeAllSubmenus() {
		const buttonsToDeactivate = document.querySelectorAll('.button-submenu-toggle.active, .btn-action.active');
		buttonsToDeactivate.forEach(button => {
			button.classList.remove('active');
		});
	}
	if (overlay) {
		overlay.addEventListener('click', closeAllSubmenus);
	}
	document.addEventListener('click', function(event) {
		const activeToggle = document.querySelector('.button-submenu-toggle.active');
		
		if (activeToggle) {
			const menuBlock = activeToggle.closest('li')?.querySelector('.menu');
			const isClickInsideMenu = menuBlock && menuBlock.contains(event.target);
			const isClickOnToggle = activeToggle.contains(event.target);
			
			if (!isClickInsideMenu && !isClickOnToggle) {
				closeAllSubmenus();
			}
		}
	});

	//btn tgl and add
	let tglButtons = document.querySelectorAll('.js-btn-tgl')
	let addButtons = document.querySelectorAll('.js-btn-add')
	let buttonsTglOne = document.querySelectorAll('.js-btn-tgl-one');
	for (i = 0;i < tglButtons.length;i++) {
		tglButtons[i].addEventListener('click', function(e) {
			this.classList.contains('active') ? this.classList.remove('active') : this.classList.add('active')
			e.preventDefault()
			return false
		})
	}
	for (i = 0;i < addButtons.length;i++) {
		addButtons[i].addEventListener('click', function(e) {
			if (!this.classList.contains('active')) {
				this.classList.add('active');
				e.preventDefault()
				return false
			}
		})
	}
	buttonsTglOne.forEach(function(button) {
		button.addEventListener('click', function(e) {
			e.preventDefault();
			let toggleButtonsWrap = this.closest('.js-toggle-buttons');
	
			if (this.classList.contains('active')) {
				this.classList.remove('active');
			} else {
				toggleButtonsWrap.querySelectorAll('.js-btn-tgl-one').forEach(function(btn) {
					btn.classList.remove('active');
				});
				this.classList.add('active');
			}
			return false;
		});
	});


	//js popup wrap
	const togglePopupButtons = document.querySelectorAll('.js-btn-popup-toggle')
	const closePopupButtons = document.querySelectorAll('.js-btn-popup-close')
	const popupElements = document.querySelectorAll('.js-popup-wrap')
	const wrapWidth = document.querySelector('.wrap').offsetWidth
	const bodyElem = document.querySelector('body')
	function popupElementsClear() {
		document.body.classList.remove('menu-show')
		document.body.classList.remove('search-show')
		if (document.querySelector('.header .button-submenu-toggle.active')) {
			document.querySelector('.header .button-submenu-toggle.active').classList.remove('active')
		}
		popupElements.forEach(element => element.classList.remove('popup-right'))
	}
	function popupElementsClose() {
		togglePopupButtons.forEach(element => {
			if (window.innerWidth < 1024) {
				if (!element.closest('.no-close-mobile') && !element.closest('.no-close')) {
					element.classList.remove('active')
				}

			} else if  (window.innerWidth > 1023) {
				if (!element.closest('.no-close-desktop') && !element.closest('.no-close')) {
					element.classList.remove('active')
				}
			} else {
				if (!element.closest('.no-close')) {
					element.classList.remove('active')
				}
			}
			
		})
	}
	function popupElementsContentPositionClass() {
		popupElements.forEach(element => {
			let pLeft = element.offsetLeft
			let pWidth = element.querySelector('.js-popup-block').offsetWidth
			let pMax = pLeft + pWidth;
			if (pMax > wrapWidth) {
				element.classList.add('popup-right')
			} else {
				element.classList.remove('popup-right')
			}
		})
	}
	for (i = 0; i < togglePopupButtons.length; i++) {
		togglePopupButtons[i].addEventListener('click', function (e) {
			popupElementsClear()
			if (this.classList.contains('active')) {
				this.classList.remove('active')
			} else {
				popupElementsClose()
				this.classList.add('active')
				if (this.closest('.popup-menu-wrap')) {
					document.body.classList.add('menu-show')
				}
				if (this.closest('.popup-search-wrap')) {
					document.body.classList.add('search-show')
				}
				if (this.closest('.popup-filter-wrap')) {
					document.body.classList.add('filter-show')
				}
				popupElementsContentPositionClass()
			}
			e.preventDefault()
			e.stopPropagation()
			return false
		})
	}
	for (i = 0; i < closePopupButtons.length; i++) {
		closePopupButtons[i].addEventListener('click', function (e) {
			popupElementsClear()
			popupElementsClose()
			e.preventDefault()
			e.stopPropagation()
			return false;
		})
	}
	document.onclick = function (event) {
		if (!event.target.closest('.js-popup-block')) {
			popupElementsClear()
			popupElementsClose()
		}
	}
	popupElements.forEach(element => {
		if (element.classList.contains('js-popup-select')) {
			let popupElementSelectItem = element.querySelectorAll('.js-popup-block li a')
			if (element.querySelector('.js-popup-block .active')) {
				element.classList.add('select-active')
				let popupElementActive = element.querySelector('.js-popup-block .active').innerHTML
				let popupElementButton = element.querySelector('.js-btn-popup-toggle')
				popupElementButton.innerHTML = ''
				popupElementButton.insertAdjacentHTML('beforeend', popupElementActive)
			} else {
				element.classList.remove('select-active')
			}
			for (i = 0; i < popupElementSelectItem.length; i++) {
				popupElementSelectItem[i].addEventListener('click', function (e) {
					this.closest('.js-popup-wrap').classList.add('select-active')
					if (this.closest('.js-popup-wrap').querySelector('.js-popup-block .active')) {
						this.closest('.js-popup-wrap').querySelector('.js-popup-block .active').classList.remove('active')
					}
					this.classList.add('active')
					let popupElementActive = element.querySelector('.js-popup-block .active').innerHTML
					let popupElementButton = element.querySelector('.js-btn-popup-toggle')
					popupElementButton.innerHTML = ''
					popupElementButton.insertAdjacentHTML('beforeend', popupElementActive)
					popupElementsClear()
					popupElementsClose()
					if (!this.closest('.js-tabs-nav')) {
						e.preventDefault()
						e.stopPropagation()
						return false
					}
				})
			}
		}
	})



	// Popups
	let popupCurrent;
	let popupsList = document.querySelectorAll('.popup-outer-box')

	document.querySelectorAll(".js-popup-open").forEach(function (element) {
	element.addEventListener("click", function (e) {
		document.querySelector(".popup-outer-box").classList.remove("active");
		document.body.classList.add("popup-open");
		for (i=0;i<popupsList.length;i++) {
			popupsList[i
				].classList.remove("active");
			}

		popupCurrent = this.getAttribute("data-popup");
		document
		.querySelector(
			`.popup-outer-box[id="${popupCurrent}"
			]`
		)
		.classList.add("active");

		e.preventDefault();
		e.stopPropagation();
		return false;
		});
	});
	document.querySelectorAll(".js-popup-close").forEach(function (element) {
	element.addEventListener("click", function (event) {
		document.body.classList.remove("popup-open");
		for (i=0;i<popupsList.length;i++) {
			popupsList[i
				].classList.remove("active");
			}
		event.preventDefault();
		event.stopPropagation();
		});
	});
	document.querySelectorAll(".popup-outer-box").forEach(function (element) {
	element.addEventListener("click", function (event) {
		if (!event.target.closest(".popup-box")) {
		document.body.classList.remove("popup-open");
		document.body.classList.remove("popup-open-scroll");
		document.querySelectorAll(".popup-outer-box").forEach(function (e) {
			e.classList.remove("active");
				});
		return false;
			}
		});
	});


	//slider photos thumbs preview
	document.querySelectorAll('.top-slider-box').forEach(function(container) {
		const thumbsEl = container.querySelector('.slider-photos-thumbs .swiper');
		const mainEl = container.querySelector('.slider-photos-main .swiper');
		const mainPag = container.querySelector('.slider-photos-main-pagination');
		const swiperPhotosPreview = new Swiper(thumbsEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 5,
			spaceBetween: 0,
			threshold: 5,
			watchSlidesVisibility: true,
			watchSlidesProgress: true,
			freeMode: false,
			navigation: false,
		});
		const swiperPhotosMain = new Swiper(mainEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			threshold: 5,
			freeMode: false,
			watchSlidesProgress: true,
			navigation: false,
			autoplay: {
				delay: 4000,
				disableOnInteraction: false,
			},
			pagination: {
				el: mainPag,
				clickable: true,
			},
			thumbs: {
				swiper: swiperPhotosPreview,
			},
		});
	});


	//slider photos thumbs preview
	document.querySelectorAll('.tiles-thumbs-slider-box').forEach(function(container) {
		const thumbsEl = container.querySelector('.slider-photos-thumbs .swiper');
		const mainEl = container.querySelector('.slider-photos-main .swiper');
	
		const swiperPhotosPreview = new Swiper(thumbsEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 5,
			spaceBetween: 0,
			threshold: 5,
			watchSlidesVisibility: true,
			watchSlidesProgress: true,
			freeMode: false,
			navigation: false,
			breakpoints: {
				1024: {
					slidesPerView: 7,
				},
			},
		});
		const swiperPhotosMain = new Swiper(mainEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			threshold: 5,
			freeMode: false,
			watchSlidesProgress: true,
			navigation: false,
			pagination: false,
			thumbs: {
				swiper: swiperPhotosPreview,
			},
		});
	});


	//slider reviews
	const slidersreviews = document.querySelectorAll(".slider-reviews");
	
	slidersreviews.forEach((container) => {
		const swiperEl = container.querySelector(".swiper");
		const paginationEl = container.querySelector(".slider-reviews-pagination");
		const nextEl = container.querySelector(".button-slider-reviews-next");
		const prevEl = container.querySelector(".button-slider-reviews-prev");
	
		if (!swiperEl) return;
	
		new Swiper(swiperEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			pagination: {
				el: paginationEl,
				clickable: true,
			},
			autoplay: false,
			navigation: {
				nextEl: nextEl,
				prevEl: prevEl,
			},
			breakpoints: {
				768: { slidesPerView: 2 },
			},
		});
	});



	//slider catalog
	const sliderscatalog = document.querySelectorAll(".slider-catalog");
	
	sliderscatalog.forEach((container) => {
		const swiperEl = container.querySelector(".swiper");
		const paginationEl = container.querySelector(".slider-catalog-pagination");
		const nextEl = container.querySelector(".button-slider-catalog-next");
		const prevEl = container.querySelector(".button-slider-catalog-prev");
	
		if (!swiperEl) return;
	
		new Swiper(swiperEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 2,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			pagination: {
				el: paginationEl,
				clickable: true,
			},
			autoplay: false,
			navigation: {
				nextEl: nextEl,
				prevEl: prevEl,
			},
			breakpoints: {
				640: { slidesPerView: 3 },
				1024: { slidesPerView: 4 },
			},
		});
	});



	//slider catalog main
	const sliderscatalogmain = document.querySelectorAll(".slider-catalogmain");
	
	sliderscatalogmain.forEach((container) => {
		const swiperEl = container.querySelector(".swiper");
		const paginationEl = container.querySelector(".slider-catalogmain-pagination");
		const nextEl = container.querySelector(".button-slider-catalogmain-next");
		const prevEl = container.querySelector(".button-slider-catalogmain-prev");
	
		if (!swiperEl) return;
	
		new Swiper(swiperEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			pagination: {
				el: paginationEl,
				clickable: true,
			},
			autoplay: false,
			navigation: {
				nextEl: nextEl,
				prevEl: prevEl,
			},
			breakpoints: {
				640: { slidesPerView: 2 },
			},
		});
	});


	//slider gallery
	const slidersgallery = document.querySelectorAll(".slider-gallery");
	
	slidersgallery.forEach((container) => {
		const swiperEl = container.querySelector(".swiper");
		const paginationEl = container.querySelector(".slider-gallery-pagination");
		const nextEl = container.querySelector(".button-slider-gallery-next");
		const prevEl = container.querySelector(".button-slider-gallery-prev");
	
		if (!swiperEl) return;
	
		new Swiper(swiperEl, {
			loop: false,
			slidesPerGroup: 1,
			slidesPerView: 1,
			spaceBetween: 0,
			autoHeight: false,
			speed: 400,
			initialSlide: 5,
			pagination: {
				el: paginationEl,
				clickable: true,
			},
			autoplay: false,
			navigation: {
				nextEl: nextEl,
				prevEl: prevEl,
			},
			breakpoints: {
				640: { slidesPerView: 2 },
			},
		});
	});


})