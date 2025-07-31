import React, { useState, useMemo } from 'react'; 
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Lightbulb, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import axios from 'axios';

import walletImage from '../assets/finalbottle.jpg';
import calculatorImage from '../assets/calculator.jpg';
import bottleImage from '../assets/ring.jpg';


const synonymMap = [
  { name: "spectacles", synonyms: ["glasses", "eyewear", "goggles", "frames", "lenses"] },
  { name: "bottle", synonyms: ["waterbottle", "flask", "sipper", "thermos", "hydrator"] },
  { name: "charger", synonyms: ["adapter", "powerbrick", "chargingcable", "usbcharger", "wallcharger"] },
  { name: "laptop", synonyms: ["notebook", "macbook", "chromebook", "thinkpad", "ultrabook"] },
  { name: "earphones", synonyms: ["earbuds", "airpods", "headphones", "earpieces", "in-ear", "buds"] },
  { name: "mobile", synonyms: ["phone", "smartphone", "cellphone", "android", "iphone", "handset"] },
  { name: "idcard", synonyms: ["id", "identitycard", "collegeid", "campusid", "badge", "accesscard"] },
  { name: "wallet", synonyms: ["purse", "moneybag", "cardholder", "leatherwallet", "cashholder"] },
  { name: "pen", synonyms: ["ballpen", "gelpen", "inkpen", "stylus", "markerpen"] },
  { name: "notebook", synonyms: ["diary", "journal", "register", "copy", "logbook"] },
  { name: "powerbank", synonyms: ["batterybank", "portablecharger", "externalbattery"] },
  { name: "usbdrive", synonyms: ["pendrive", "flashdrive", "thumbdrive", "memorystick", "stickdrive"] },
  { name: "mouse", synonyms: ["computer mouse", "wirelessmouse", "touchpad", "clicker"] },
  { name: "keyboard", synonyms: ["keypad", "typedevice", "wirelesskeyboard"] },
  { name: "watch", synonyms: ["wristwatch", "smartwatch", "band", "fitband", "timer"] },
  { name: "bag", synonyms: ["backpack", "bagpack", "rucksack", "satchel", "kitbag", "tote"] },
  { name: "calculator", synonyms: ["calc", "scientificcalc", "casio", "mathdevice"] },
  { name: "keys", synonyms: ["lockerkeys", "roomkeys", "keychain", "bikekeys", "housekeys", "keyring"] },
  { name: "umbrella", synonyms: ["rainshade", "parasol", "raincover"] },
  { name: "helmet", synonyms: ["bikehelmet", "safetyhelmet", "headgear"] },
  { name: "cap", synonyms: ["hat", "baseballcap", "headcover", "visor"] },
  { name: "tiffin", synonyms: ["lunchbox", "dabba", "container", "lunchcase"] },
  { name: "shoes", synonyms: ["footwear", "sneakers", "trainers", "sportswear", "loafers"] },
  { name: "slippers", synonyms: ["flipflops", "sandals", "chappals", "slides"] },
  { name: "simcard", synonyms: ["sim", "networkcard", "telecomchip"] },
  { name: "otg", synonyms: ["usbconverter", "usbadapter", "otgcable", "typecconnector"] },
  { name: "remote", synonyms: ["controller", "tvremote", "clicker", "irremote"] },
  { name: "jacket", synonyms: ["coat", "hoodie", "sweater", "zipper", "blazer", "windcheater"] },
  { name: "textbook", synonyms: ["book", "coursebook", "referencebook", "module", "subjectbook"] },
  { name: "marker", synonyms: ["highlighter", "whiteboardpen", "sketchpen", "boardmarker"] },
  { name: "medicines", synonyms: ["tablets", "pills", "capsules", "strip", "drugs"] },
  { name: "box", synonyms: ["cardboard", "carton", "rectangular box", "package"] },
  { name: "earrings", synonyms: ["jewelry", "studs", "jhumkas", "earringset"] },
  { name: "belt", synonyms: ["waistbelt", "leatherbelt", "strap"] },
  { name: "coin", synonyms: ["change", "loosechange", "currencycoin", "moneycoin"] },
  { name: "tripod", synonyms: ["stand", "camerastand", "mobiletripod"] },
  { name: "camera", synonyms: ["dslr", "digicam", "cam", "photodevice"] },
  { name: "tablet", synonyms: ["ipad", "tab", "androidtab", "notetab"] },
  { name: "badge", synonyms: ["tag", "nametag", "idbadge"] },
  { name: "scarf", synonyms: ["dupatta", "stole", "shawl", "wrap"] },
  { name: "usb-cable", synonyms: ["datacable", "cord", "chargerwire", "syncwire"] },
  { name: "harddisk", synonyms: ["hdd", "externaldisk", "backupdrive"] },
  { name: "tripass", synonyms: ["buspass", "idpass", "commutepass"] },
  { name: "stationery", synonyms: ["pen", "pencil", "eraser", "sharpener", "scale", "ruler", "sketchpen"] },
  { name: "helmetlock", synonyms: ["bikelock", "lockchain"] },
  { name: "lens", synonyms: ["dslrlens", "zoomlens", "cameraaccessory"] },
  { name: "hairband", synonyms: ["rubberband", "scrunchie", "band"] },
  { name: "projector", synonyms: ["beamer", "presentationdevice"] },
  { name: "bikekey", synonyms: ["two-wheelerkey", "vehicleremote"] },
  { name: "watchstrap", synonyms: ["bandstrap", "watchbelt"] },
  { name: "perfume", synonyms: ["deodorant", "scent", "spray"] },
  { name: "lunchbag", synonyms: ["tiffinbag", "dabba-bag", "snackbag"] },
  { name: "gloves", synonyms: ["handgloves", "mittens", "ridinggloves"] },
  { name: "sunscreen", synonyms: ["sunblock", "uvlotion", "spfcream"] },
  { name: "folder", synonyms: ["file", "documentsleeve", "paperholder"] },
  { name: "projectfile", synonyms: ["report", "assignmentfile", "submissionfile"] }
];

const FindLostItemPage = () => {
  const [objectName, setObjectName] = useState('');
  const [objectDescription, setObjectDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [locationLost, setLocationLost] = useState('');
  const [dateLost, setDateLost] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  

const allSynonyms = synonymMap.flatMap(({ name, synonyms }) => [name, ...synonyms]);

const resolveCanonicalName = (input) => {
  const lowerInput = input.toLowerCase();
  for (let entry of synonymMap) {
    if (entry.name === lowerInput || entry.synonyms.includes(lowerInput)) {
      return entry.name;
    }
  }
  return input;
};

const handleNameChange = (e) => {
  const value = e.target.value;
  setObjectName(value);

  if (value.length > 0) {
    const matches = allSynonyms.filter((syn) =>
      syn.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestions(matches.slice(0, 5));
  } else {
    setSuggestions([]);
  }
};

const handleSuggestionClick = (value) => {
  const canonical = resolveCanonicalName(value);
  setObjectName(canonical);
  setSuggestions([]);
};



  const campusLocations = useMemo(() => {
    const generalLocations = ['Campus', 'Grounds'];
    const buildings = ['A', 'B', 'C', 'D', 'E'];
    return [...generalLocations, ...buildings];
  }, []);

  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    if (!objectName && !objectDescription && !selectedImage && !locationLost && !dateLost) {
      setMessage('Please fill out at least one field to report a lost item.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('objectName', objectName);
    formData.append('objectDescription', objectDescription);
    formData.append('locationLost', locationLost);
    formData.append('dateLost', dateLost);
    if (selectedImage) {
      formData.append('objectImage', selectedImage);
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/apis/lost-and-found/object-query/report-lost`, formData, config);
      setMessage(response.data.message || 'Lost item reported successfully!');
      setObjectName('');
      setObjectDescription('');
      setSelectedImage(null);
      setLocationLost('');
      setDateLost('');
    } catch (err) {
      console.error('Error reporting lost item:', err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setMessage('Session expired or not authenticated. Please log in to report an item.');
      } else {
        setMessage(err.response?.data?.message || 'Failed to report lost item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-gray-100">
      <div className="flex flex-col justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium">
              <ArrowLeft size={18} />
              Back to Home
          </Link>
          <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <div className="text-left mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Find my Lost Item</h1>
              <p className="text-gray-500 mt-2">Provide details about your lost item to help us find it.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="relative">
  <Label htmlFor="object-name">Object Name</Label>
  <input
    id="object-name"
    type="text"
    value={objectName}
    onChange={handleNameChange}
    placeholder="e.g., iPhone 14 Pro, Blue Backpack"
    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    required
  />
  {suggestions.length > 0 && (
    <ul className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded-lg shadow-md max-h-40 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <li
          key={index}
          onClick={() => handleSuggestionClick(suggestion)}
          className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-sm text-gray-700"
        >
          {suggestion}
        </li>
      ))}
    </ul>
  )}
</div>


              <div>
                <Label htmlFor="object-description">Object Description</Label>
                <textarea
                  id="object-description"
                  rows={3}
                  value={objectDescription}
                  onChange={(e) => setObjectDescription(e.target.value)}
                  placeholder="Describe the item: color, brand, any unique features..."
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location-lost">Location Lost</Label>
                {}
                <select
                  id="location-lost"
                  value={locationLost}
                  onChange={(e) => setLocationLost(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  required
                >
                  <option value="" disabled>Select a location</option>
                  {campusLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date-lost">Date Lost</Label>
                <input
                  id="date-lost"
                  type="date"
                  value={dateLost}
                  onChange={(e) => setDateLost(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image-upload">Upload Image (Optional)</Label>
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  {selectedImage ? (
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-cover rounded-xl"/>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="font-semibold">Upload an image of the item</p>
                      <p className="text-xs">This can improve matching accuracy</p>
                    </div>
                  )}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {message && (
                <p className={`text-center text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}

              <Button type="submit" variant="primary" disabled={loading}>
                <Search className="w-5 h-5" />
                {loading ? 'Reporting...(Do not close this page)' : 'Report Lost Item'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-12 lg:p-20">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Tips for Reporting</h2>
          </div>
          <ul className="space-y-6 text-gray-600">
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">1.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Be Specific</h3>
                <p>Provide detailed information about the item, including color, brand, and any unique marks.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">2.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Accurate Location & Date</h3>
                <p>Pinpoint where and when you last saw the item. This is crucial for matching. If you don't know exact location you can choose "campus".</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="font-bold text-blue-500">3.</div>
              <div>
                <h3 className="font-semibold text-gray-800">Upload a Clear Image</h3>
                <p>A good quality image significantly increases the chances of your item being recognized.</p>
              </div>
            </li>
          </ul>


 
          <div className="mb-6 mt-4"> 
            <h3 className="text-xl font-bold text-gray-800">Reference Images</h3> 
            <p className="text-gray-600 text-sm mt-2">
              Examples of clear images for effective posting.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={walletImage}
                alt="Be Specific"
                className="w-full h-36 object-cover"
              />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={calculatorImage}
                alt="Location & Date"
                className="w-full h-36 object-cover"
              />
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden items-center">
              <img
                src={bottleImage}
                alt="Clear Image"
                className="w-full h-36 object-cover"
              />
            </div>
          </div>
          
          
          
        </div>
      </div>
    </main>
  );
};

export default FindLostItemPage;
