import { Alert, AlertIcon, AlertTitle, Box, Button, Flex, Spinner } from "@chakra-ui/react"
import { Form, Formik } from "formik"
import NextLink from 'next/link'
import { useRouter } from "next/router"
import InputField from "../../../components/InputField"
import Layout from "../../../components/Layout"
import { UpdatedPostInput, useMeQuery, usePostQuery, useUpdatePostMutation } from "../../../generated/graphql"


const PostEdit = () => {
  const router = useRouter()
  const postId = router.query.id as string

  const {data: meData, loading: meLoading} = useMeQuery()

  const {data: postData, loading: postLoading} = usePostQuery({variables: {id: postId}})

  const [updatePost] = useUpdatePostMutation()

  const onUpdatePostSubmit = async (values: Omit<UpdatedPostInput, 'id'>) => {
    await updatePost({
      variables: {updatedPostInput: {
        id: postId,
        ...values
      }}
    })
    router.back();
  }

  if(meLoading || postLoading) {
    <Flex justifyContent='center' alignItems='center' minHeight='100vh'>
      <Spinner />
    </Flex>
  }

  if(!postData?.post) return (
    <Layout>
      <Alert status='error'>
        <AlertIcon />
        <AlertTitle>Post not Found</AlertTitle>
      </Alert>
      <Box mt={4}>
        <NextLink href='/'>
          <Button>Back to homepage</Button>
        </NextLink>
      </Box>
    </Layout>
  )

  if(!meLoading && !postLoading && meData?.me?.id !== postData?.post?.userId.toString()) return (
    <Layout>
      <Alert status='error'>
        <AlertIcon />
        <AlertTitle>Unauthorised</AlertTitle>
      </Alert>
      <Box mt={4}>
        <NextLink href='/'>
          <Button>Back to homepage</Button>
        </NextLink>
      </Box>
    </Layout>
  )

  const initialValues = {title: postData.post.title, text: postData.post.text}

  return (
    <Layout>
      <Formik initialValues={initialValues} onSubmit={onUpdatePostSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <Box mt={4}>
              <InputField
                name='title'
                placeholder='Title'
                label='Title'
                type='text'
              />
            </Box>
            <Box mt={4}>
              <InputField
                textarea
                name='text'
                placeholder='Text'
                label='Text'
                type='textarea'
              />
            </Box>

            <Flex justifyContent='space-between' alignItems='center' mt={4}>
              <Button
                type='submit'
                colorScheme='teal'
                isLoading={isSubmitting}>
                Update Post
              </Button>
              <NextLink href='/'>
                <Button>Back to homepage</Button>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default PostEdit
