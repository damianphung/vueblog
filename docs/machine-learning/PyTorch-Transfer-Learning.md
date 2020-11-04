---
title: PyTorch Transfer Learning
date: 2020-11-02
description:
    Data Preparation + Resnet 
---

 Notes on how to fine-tune a classification model starting from getting the raw image data ourselves.

## Getting raw data
There are many ways of getting data from the internet. I used the Bing image search API, which you can find instructions on how to do so [here](https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/create-bing-search-service-resource)


Here is some sample code on calling the API after creating a Bing Search resource
```python
import requests

subscription_key = "YOUR KEY"
search_url = "https://api.bing.microsoft.com/v7.0/images/search"
sample_size = 35

search_terms = [ "puppies", "kittens" ]
headers = {"Ocp-Apim-Subscription-Key" : subscription_key}

search_results = {}
for search in search_terms:
    params  = {"q": search, "license": "public", "imageType": "photo", "count": sample_size }
    response = requests.get(search_url, headers=headers, params=params)
    response.raise_for_status()
    search_results[search] = response.json()
```

Let's plot it for the images of puppies we got.
```python
import matplotlib.pyplot as plt
from PIL import Image
from io import BytesIO

thumbnail_urls = [img["thumbnailUrl"] for img in search_results["puppies"]["value"][:16]]
f, axes = plt.subplots(4, 4)
for i in range(4):
    for j in range(4):
        image_data = requests.get(thumbnail_urls[i+4*j])
        image_data.raise_for_status()
        image = Image.open(BytesIO(image_data.content))        
        axes[i][j].imshow(image)
        axes[i][j].axis("off")
plt.show()
```

Download the images we stored in ```search_results``` in to a directory named after the search term we queried to Bing. This will be our class label for classification.

```python
from pathlib import Path
import requests

root_dir = Path()
list_animals = [ "puppies", "kittens" ]

for a in list_animals: 
    label_dir = root_dir / "animals" / a
    if not url_path.exists():
        label_dir.mkdir(mode=0o777, parents=True, exist_ok=False)

    for idx, image in enumerate(search_results[a]["value"]):
        print(image["contentUrl"])
        response = requests.get(image["contentUrl"])
        fileName = str(idx) + '.' + image["contentUrl"][-3:] # last 3 chars
        download_path = label_dir / fileName
        with open(download_path, "wb") as file:
            file.write(response.content)
```

### Cleaning the data
Then let's remove the images that aren't really images...
```py
import os
from PIL import Image

# Verify by using the PIL image library.
# open an image and grayscale it as a sanity test.
def verify_img(image):
    try:
        im = Image.open(image)
        im.draft(im.mode, (32,32))
        im.load()
        return True
    except:
        return False

base_dir = root_dir / 'animals'
for animal_picture in sorted(base_dir.glob("*/*")):
    valid_image = verify_img(animal_picture)
    if not valid_image:
        print("Removing: ", animal_picture)
        os.unlink(animal_picture)   
```

So far we've only gathered raw data of puppies and kitten, and then put them into directories.  

This is normally the starting point of most tutorials that teach you how to do something with a model. 

## Load the data in to PyTorch

### Custom DataSet
When creating custom datasets in PyTorch we need to create a ```Dataset``` subclass with ```__len__``` and ```__getitem__``` defined.

The key thing to understand is that the ```__getitem__``` method should return a tuple which contains the sample data and label, given an index.
i.e: print(MyDataSet[0]) should return (<Tensor>, label), where Tensor is the data sample of the image we downloaded as a PyTorch Tensor.

We also have to create a transform pipeline for each dataset, where each data sample will go through a series of transformations before being forwarded to our network.

```py
from pathlib import *
from torch.utils.data import Dataset, DataLoader
import torchvision
import torchvision.transforms as transforms

base_dir = Path() / 'animals'

# [0.485, 0.456, 0.406] is the mean of ImageNet
# [0.229, 0.224, 0.225] is the std  of ImageNet
# These numbers are calculated based on millions of images. So just use that instead of calculating our own :) .
transform = transforms.Compose([
                                transforms.RandomResizedCrop(224),
                                transforms.RandomHorizontalFlip(),
                                transforms.ToTensor(),
                                transforms.Normalize([0.485, 0.456, 0.406],
                                                     [0.229, 0.224, 0.225])
])

def getClassesFromDirNames(dir):
    classes = [d.name for d in os.scandir(dir) if d.is_dir()]
    classes.sort()
    class_to_idx = {cls_name: i for i, cls_name in enumerate(classes)}
    return classes, class_to_idx

def getSamples(dir, class_dict):
    samples = []
    for target_class in sorted(class_dict.keys()):
        class_index = class_dict[target_class]
        subdir = os.path.join(dir, target_class)
        for root, _, files  in sorted(os.walk(subdir, followlinks=True)):
            for file in sorted(files):
                path = os.path.join(root, file)
                item = path, class_index
                samples.append(item)
    return samples

class AnimalDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        print("root dir ", self.root_dir)
        # Get list of classes by scanning dir. get the index to class
        self.classes, self.class_mapping = getClassesFromDirNames(root_dir)
        
        # Then get the path to the sample, and the label.
        self.samples = getSamples(root_dir, self.class_mapping)
        print(self.samples)
        self.transform = transform
    
    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img = Image.open(self.samples[idx][0]) # idx, path to image
        if self.transform: 
            img = self.transform(img)
        print("---", img)
        return img, self.samples[idx][1]     # idx, class label based on directory name

animal_dataset = AnimalDataset(root_dir=base_dir, transform=transform)

dataloader = torch.utils.data.DataLoader(animal_dataset, batch_size=4, shuffle=True, num_workers=0)
```

Let's see a sample.
```py
data_sample = animal_dataset[0][0]
label_idx = animal_dataset[0][1]
plt.imshow(sample.data_sample().transpose((1, 2, 0)))
print("label index is ", label_idx)
```

### Using ImageFolder
But of course; Why re-invent the wheel when we can just use ImageFolder instead!

This time we will split our data.
We create two Datasets. one for train, and another for test.
The amount we split the ratio is up to us, but normally I see many people do an 80-20 train-test split. 

We then put it in to a DataLoader class.
This DataLoader class provides us the ability to do mini-batching!.
Rather than train our model with one image at a time, we can do it in groups.  
This is where a GPU comes in handy.
```py
from torch.utils.data import Dataset, DataLoader
import torchvision
import torchvision.datasets as datasets
import torchvision.transforms as transforms

# Given an array of indices, split it into a tuple containing the train and test indices
def getRandomIdx(imageset_size):
    torch.manual_seed(42)
    idx_list = torch.randperm(len(imageset_size))
    rand = [int(i) for i in idx_list ]
    cut = int (0.2 * len(imageset_size))
    train_test_subset = rand[cut:], rand[:cut]
    return train_test_subset

train_transform = transforms.Compose([
                                transforms.RandomResizedCrop(224),
                                transforms.RandomHorizontalFlip(),
                                transforms.ToTensor(),
                                transforms.Normalize([0.485, 0.456, 0.406],
                                                     [0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
                                transforms.Resize(256),
                                transforms.CenterCrop(224),
                                transforms.ToTensor(),
                                transforms.Normalize([0.485, 0.456, 0.406],
                                                     [0.229, 0.224, 0.225])
])

train_imageset  = torchvision.datasets.ImageFolder(root='animals', transform=train_transform)
test_imageset   = torchvision.datasets.ImageFolder(root='animals', transform=test_transform)

train_test_subset = getRandomIdx(train_imageset)
train_idx, test_idx = train_test_subset

train_data = Subset(train_imageset, indices=train_idx)
test_data  = Subset(test_imageset, indices=test_idx)

train_dataloader = torch.utils.data.DataLoader(train_data, batch_size=4, shuffle=True, num_workers=0)
test_dataloader  = torch.utils.data.DataLoader(test_data, batch_size=4, shuffle=False, num_workers=0)
```
Let's see the shape of our data.
```py
dataiter = iter(train_dataloader)
images, labels = dataiter.next()

print(images.shape)
print(labels.shape)
```

```
torch.Size([4, 3, 224, 224])
torch.Size([4])
```
Image: Mini batch size of 4, followed by 3 input channels with 224x224 pixels
Label: a array containing the labels, corresponding to the mini batch.

Note:
There are a few ways to split our data. We just used ```Subset``` and provided that into our DataLoader.


There's also ```torch.utils.data.random_split``` and ```SubsetRandomSampler``` for example.

## Transfer Learning
Ok. Time for the juicy part. Let's get a pre-trained resnet18 model.
Freeze the weights of our model and modify our fully connected layer to only have 2 outputs, since we only have kittens and puppies.

Run it on a GPU if we have it.
```py
device = torch.device("cuda" if torch.cuda.is_available()
                               else "cpu")
model = models.resnet18(pretrained = True)
for param in model.parameters():
    param.requires_grad = False

# Parameters of newly constructed modules have requires_grad=True by default
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 2) # 2 since we only have kittens and puppies as our labels
model.to(device)
```


### Training
```py
# train_dataloader
def train_model(input_model, train_dataloader, criterion, optimizer, num_epochs):
    epochs = num_epochs
    running_loss = 0
    train_losses, test_losses = [], []    
    for epoch in range(epochs):
        for inputs, labels in train_dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            logps = input_model(inputs)
            loss = criterion(logps, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            
    print('Finished Training')
    return input_model

optimizer = optim.Adam(model.fc.parameters(), lr=0.002)
criterion = nn.NLLLoss()
model = train_model(model, train_dataloader, criterion, optimizer, num_epochs=25)
```

### Test
```py
def test_model(input_model, test_dataloader):
    was_training = input_model.training
    input_model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for i, data in enumerate(test_dataloader):
            images, labels = data
            images = images.to(device)
            labels = labels.to(device)
            outputs = input_model(images)
            x, predicted = torch.max(outputs.data, 1)

            print("pred: {} {} ", x, predicted)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()
        input_model.train(mode=was_training)
    print('Accuracy of the network on test images: %d %%' % (
        100 * correct / total))
    
test_model(model, test_dataloader)
```

## Human sanity test it
Create a function that will allow us to see the images being tested..

```py
def imshow(inp, title=None):
    """Imshow for Tensor."""
    inp = inp.numpy().transpose((1, 2, 0))
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    inp = std * inp + mean
    inp = np.clip(inp, 0, 1)
    plt.imshow(inp)
    if title is not None:
        plt.title(title)
    plt.pause(0.001)  # pause a bit so that plots are updated

def test_model(input_model, test_dataloader):
    was_training = input_model.training
    input_model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for i, data in enumerate(test_dataloader):
            images, labels = data
            # Add these lines
            print("Shape -> ", images.shape)
            op = torchvision.utils.make_grid(images)
            imshow(op, title=[test_imageset.classes[x] for x in labels])
            # 
            images = images.to(device)
            labels = labels.to(device)
            outputs = input_model(images)
            x, predicted = torch.max(outputs.data, 1)

            print("pred: {} {} ", x, predicted)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()
        input_model.train(mode=was_training)
    print('Accuracy of the network on test images: %d %%' % (
        100 * correct / total))    

test_model(model, test_dataloader)
```

Result:
![Picture](/uploads/PyTorch-Transfer-Learning-1.png)

## Saving the model 
We could just save the entire model like this:
```py
PATH = 'finetunedresnet.pth'
torch.save(model, PATH)
```

However this will save the entire module using [pickle](https://docs.python.org/3/library/pickle.html).

The problem with this is that the serialized data is bound to the specific classes and the exact directory structure used when the model is saved.
So you'll have to worry about where you save it and how you name the classes when using pickle. Yuk!


Here are better ways of saving the model.

### For resume training
```py
torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'loss': loss
            }, PATH)
```

We then can put this within our ```train_model``` function after each epoch, to create a checkpoint.


Then load it like this.
```py

def load_model():
    saved_model = models.resnet18(pretrained = True)
    for param in model.parameters():
        param.requires_grad = False

    # Parameters of newly constructed modules have requires_grad=True by default
    num_ftrs = saved_model.fc.in_features
    saved_model.fc = nn.Linear(num_ftrs, 2)
    saved_optimizer =  optim.Adam(saved_model.fc.parameters(), lr=0.002)

    checkpoint = torch.load(PATH) 
    saved_model.load_state_dict(checkpoint['model_state_dict'])
    saved_optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
    epoch = checkpoint['epoch']
    loss = checkpoint['loss']

    return saved_model, saved_optimizer, epoch, loss

model, optim, epoch, loss = load_model()
model.eval()
# - or -
model.train()

# Print out the weights
print(model.state_dict())
```

### For inference.
We only need to save the weights of the model.
```py
torch.save(model.state_dict(), PATH)
```

We can then load it like this.
```py
model.load_state_dict(torch.load(PATH))
model.eval()

```

