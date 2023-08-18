const data = [
    // lake wa fully closed
    {
    "coordinates": [47.644061, -122.302796],
    "message": `
    <div>
      <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>Lake Washington Boulevard fully closed 7/23 - 8/4</h2> 
      <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
        06/19/2023 to 09/26/2023  <br/>
        5:00 a.m. to 10:00 p.m.  <span style='float: right'> <img src='/img/checked_mark.png' style='height: 20px; width: 20px;'> Highway closure  </span><br/>   </p>
       <p><a href="https://sr520-beta2023.azurewebsites.net/construction-lake-washington.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
   
      <p>
      Crews are completing drainage and the new permanent roadway. Lake Washington Boulevard will be closed in both directions from 10 p.m. Sunday, July 23, to 10 p.m., to Friday, August 4, between 24th Avenue and Montlake Boulevard. The westbound SR 520 off-ramp to Lake Washington Boulevard will also be closed during this time.</p>
                                <p>Traffic: Lake Washington Boulevard will be closed in both directions from 10 p.m. Sunday, July 23, to 10 p.m. Friday, August 4, between 24th Avenue and Montlake Boulevard. The westbound SR 520 off-ramp to Lake Washington Boulevard will also close.
      </p>
      <img src='img/2023_0731_Montlake-LWBClosure.png' style='max-height: 150px; width: auto;' alt='map' onclick="window.open('https://sr520-beta2023.azurewebsites.net/img/2023_0731_Montlake-LWBClosure.png', '_blank')"/> <br/>Click on image to expand
      <p>
        <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
        Email: sr520bridge@wsdot.wa.gov<br/>
        24-hour construction hotline: 206-775-8885
      </p>
    </div>
    `,
    "iconUrl": "img/high_impact_construction.png",
    "iconSize": [30, 30],
    "startDate": "2023-07-23",
    "endDate": "2023-08-04",
    "type": "High Impact Construction"     
  },
  // Start westbound roanoke
  {
  "coordinates": [47.642814, -122.318351],
  "message": `
  <div>
    <h2 style='font-size: 1.2em; color: #007b5f; font-weight: 600; padding: 4px;'>Westbound SR 520 off-ramp to East Roanoke Street closed weeknights through 8/10</h2> 
    <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
      7/10/2023 to 8/10/2023  <br/>
      8:00 a.m. to 5:00 p.m.  <span style='float: right'> <img src='/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
     <p><a href="https://sr520-beta2023.azurewebsites.net/construction-westbound-sr-520.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
  
    <p>
    The westbound SR 520 off-ramp to East Roanoke Street will close at 8 p.m. nightly (Monday through Thursday) through August 10. The ramp will re-open by 5 a.m. each morning.
    </p>
    <img src='https://sr520-beta2023.azurewebsites.net/img/roanoke-west.png' style='max-height: 150px; width: auto;' alt='map' onclick="window.open('https://sr520-beta2023.azurewebsites.net/img/roanoke-west.png', '_blank')"/> <br/>Click on image to expand
    <p>
      <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
      Email: sr520bridge@wsdot.wa.gov<br/>
      24-hour construction hotline: 206-775-8885
    </p>
  </div>
  `,
  "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/high_impact_construction.png",
  "iconSize": [30, 30],
  "startDate": "2023-07-10",
  "endDate": "2023-08-10",          
  "type": "Ramp Closures"  
  },
  
  {
  "coordinates": [47.636763, -122.240021],
  "message": "<h2>LIVE WEBCAM:</h2><p> <iframe src='https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88B9B2qPMb6E316d3h59C-OM!/sr_520__-_montlake_project/camera_1/view_1' width='450px' height='450px'></iframe> </p>",
  "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/icon_Camera.png",
  "iconSize": [30, 30],
  "startDate": "2023-06-07",
  "endDate": "2023-06-30",
  "type": "Cameras"  
  },
  // {
  // "coordinates": [47.635606, -122.236944],
  // "message": `
  // <div style='min-width: 15vw; height: auto; z-index: 999;'>
  //   <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>SR 520 on- and off-ramps between SR 520 and Montlake Blvd closed</h2> 
  //   <p style='margin-bottom: 15px; font-weight: 600;'>
  //     06/19/2023 to 09/26/2023  <br/>
  //     5:00 a.m. to 10:00 p.m.  <span style='float: right'> <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Around-the-clock&nbsp;&nbsp;    <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
  //    <p><a href="https://sr520-beta2023.azurewebsites.net/construction-mercer-street.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
  
  //   <p>
  //     Montlake Boulevard between East Hamlin Street and East Roanoke Street will reduce to only one lane of traffic open for each direction around-the-clock beginning at 5 a.m. Monday, June 19 through 5 a.m. Monday, June 26. Travelers should plan for alternate routes or expect additional congestion in the area.
  //   </p>
  //   <img src='https://sr520construction.com/images/Lid_Rendering_page1.jpg' style='max-width: 100%; height: auto;' alt='map' onclick="window.open('https://sr520construction.com/images/Lid_Rendering_page1.jpg', '_blank')"/> <br/>Click on image to expand
  //   <p>
  //     <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
  //     Email: sr520bridge@wsdot.wa.gov<br/>
  //     24-hour construction hotline: 206-775-8885
  //   </p>
  // </div>
  // `,
  // "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/trail_closure.png",
  // "iconSize": [25, 25],
  // "startDate": "2023-05-07",
  // "endDate": "2023-05-30",
  //   "type": "Trail Closures"   
  // },
  // {
  // "coordinates": [47.641807, -122.316945],
  // "message": `
  // <div style='min-width: 15vw; height: auto; z-index: 999;'>
  //   <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>SR 520 on- and off-ramps between SR 520 and Montlake Blvd closed</h2> 
  //   <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
  //     06/19/2023 to 09/26/2023  <br/>
  //     5:00 a.m. to 10:00 p.m.  <span style='float: right'> <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 18px; width: 18px;'> Around-the-clock&nbsp;&nbsp;    <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
  //    <p><a href="https://sr520-beta2023.azurewebsites.net/construction-mercer-street.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
  
  //   <p>
  //     Montlake Boulevard between East Hamlin Street and East Roanoke Street will reduce to only one lane of traffic open for each direction around-the-clock beginning at 5 a.m. Monday, June 19 through 5 a.m. Monday, June 26. Travelers should plan for alternate routes or expect additional congestion in the area.
  //   </p>
  //   <img src='https://sr520construction.com/images/Lid_Rendering_page1.jpg' style='max-width: 100%; height: auto;' alt='map' onclick="window.open('https://sr520construction.com/images/Lid_Rendering_page1.jpg', '_blank')"/> <br/>Click on image to expand
  //   <p>
  //     <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
  //     Email: sr520bridge@wsdot.wa.gov<br/>
  //     24-hour construction hotline: 206-775-8885
  //   </p>
  // </div>
  // `,
  // "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/high_impact_construction.png",
  // "iconSize": [30, 30],
  // "startDate": "2023-05-25",
  // "endDate": "2023-06-30",
  //   "type": "Street and Lane Closures"   
  // }, 
  
  {
  "coordinates": [47.644298, -122.298823],
  "message": "<h2>LIVE WEBCAM:</h2><p> <iframe src='https://share.earthcam.net/tJ90CoLmq7TzrY396Yd88B9B2qPMb6E316d3h59C-OM!/sr_520__-_montlake_project/camera_1/view_1' width='450px' height='450px'></iframe> </p>",
  "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/icon_Camera.png",
  "iconSize": [30, 30],
  "startDate": "2023-06-07",
  "endDate": "2023-06-30",
  "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/icon_Camera.png",
  "iconSize":[30, 30],
  "startDate": "2023-05-22",
  "endDate": "2023-07-25",
  "type": "Cameras"   
  }, 
  
  {
    "coordinates": [47.644819, -122.295527],
    "message": `
    <div style='min-width: 15vw; height: auto; z-index: 999;'>
      <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>Trail Closure [SAMPLE]</h2> 
      <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
        06/19/2023 to 09/26/2023  <br/>
        5:00 a.m. to 10:00 p.m.  <span style='float: right'> <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 18px; width: 18px;'> Around-the-clock&nbsp;&nbsp;    <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
       <p><a href="#" target="_blank"  style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
   
      <p>
      This is an example of a trail closure icon and message. It's where we would have information about the trail closure. <p>
  
     <p>   <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
        Email: sr520bridge@wsdot.wa.gov<br/>
        24-hour construction hotline: 206-775-8885
      </p>
    </div>
    `,
    "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/trail_closure.png",
    "iconSize": [25, 25],
    "startDate": "2023-05-07",
    "endDate": "2023-05-30",
      "type": "Trail Closures"   
    },
    // {
    // "coordinates": [47.642621, -122.273306],
    // "message": `
    // <div style='min-width: 15vw; height: auto; z-index: 999;'>
    //   <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>SR 520 on- and off-ramps between SR 520 and Montlake Blvd closed</h2> 
    //   <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
    //     06/19/2023 to 09/26/2023  <br/>
    //     5:00 a.m. to 10:00 p.m.  <span style='float: right'> <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 18px; width: 18px;'> Around-the-clock&nbsp;&nbsp;    <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
    //    <p><a href="https://sr520-beta2023.azurewebsites.net/construction-mercer-street.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
   
    //   <p>
    //     Montlake Boulevard between East Hamlin Street and East Roanoke Street will reduce to only one lane of traffic open for each direction around-the-clock beginning at 5 a.m. Monday, June 19 through 5 a.m. Monday, June 26. Travelers should plan for alternate routes or expect additional congestion in the area.
    //   </p>
    //   <img src='https://sr520construction.com/images/Lid_Rendering_page1.jpg' style='max-width: 100%; height: auto;' alt='map' onclick="window.open('https://sr520construction.com/images/Lid_Rendering_page1.jpg', '_blank')"/> <br/>Click on image to expand
    //   <p>
    //     <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
    //     Email: sr520bridge@wsdot.wa.gov<br/>
    //     24-hour construction hotline: 206-775-8885
    //   </p>
    // </div>
    // `,
    // "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/high_impact_construction.png",
    // "iconSize": [30, 30],
    // "startDate": "2023-05-25",
    // "endDate": "2023-07-30",
    //   "type": "High Impact Construction"   
    // }, 
  
    // i5 off ramps close
    {
    "coordinates": [47.64275216181517, -122.32164756789759], 
    "message": `
    <div style='min-width: 15vw; height: auto; z-index: 999;'>
      <h2 style='font-size: 1.4em; color: #007b5f; font-weight: 600; padding: 4px;'>Southbound I-5 and express lanes off-ramps to Mercer Street closed 8/4 - 8/7</h2> 
      <p style='margin-bottom: 15px; font-size: 15px; font-weight: 600;'>
        08/04/2023 to 08/07/2023  <br/>
        9:00 a.m. to 5:00 p.m.  <span style='float: right'>  <img src='https://sr520-beta2023.azurewebsites.net/img/checked_mark.png' style='height: 20px; width: 20px;'> Ramp closure  </span><br/>   </p>
       <p><a href="https://sr520-beta2023.azurewebsites.net/construction-mercer-street.html" target="_blank" style="background-color: #cbdcb2; text-decoration: underlined; padding: 5px; color: #000; font-weight: 600; border-radius: 5px;">More information</a></p>
   
      <p>
      The southbound I-5 and I-5 express lanes off-ramps to Mercer Street will close beginning at 9 p.m. Friday, Aug. 4 until 5 a.m. Monday, Aug. 7 for paving work.
      </p>
      <img src='https://sr520-beta2023.azurewebsites.net/img/south15mercerclose.png' style='max-width: 100%; height: auto;' alt='map' onclick="window.open('https://sr520-beta2023.azurewebsites.net/img/south15mercerclose.png', '_blank')"/> <br/>Click on image to expand
      <p>
        <span style="font-weight: 600; color: #007b5f;">CONTACT</span><br/>
        Email: sr520bridge@wsdot.wa.gov<br/>
        24-hour construction hotline: 206-775-8885
      </p>
    </div>
    `,
    "iconUrl": "https://sr520-beta2023.azurewebsites.net/img/whitedash-onred.png",
    "iconSize":[30, 30],
    "startDate": "2023-06-02",
    "endDate": "2023-07-25",
    "type": "Ramp Closures"   
    } 
  
  ];
  